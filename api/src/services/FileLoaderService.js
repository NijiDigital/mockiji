'use strict';

let util = require('util');
let fs = require('fs');
let url = require('url');
let glob = require('glob-all');

// Configuration
let env = require('../../config/env.json');
let config = require('../../config/'+ env.name +'.json');

// Logger
let bunyan = require('bunyan');
let log = bunyan.createLogger({name: config.logger.name});

/**
 * This service is for loading the right file
 */
let FileLoaderService = function() {

  /**
   * Find the right file to load
   */
  function find(paths) {

    let files = [];

    let fileMatch = false;
    paths.forEach(function(element) {
      if(fileMatch) {
        return;
      }

      files = glob.sync(element);
      if(files.length > 0) {
        log.info({'files': util.inspect(files), 'key': element}, 'FILE MATCH!');
        fileMatch = true;
      }
    });

    if(files.length > 0) {
      log.warn('Multiple files found, selecting the first one: ' + files);
      let file = files[0];
      return file;
    }

    return null;
  }

  /**
   * Load the file located at the path
   */
  function load(path, request, paths) {

    let fileContent = fs.readFileSync(path, 'utf8');
    let content = null;
    let notices = [];

    let isScriptMock = _isScriptMockFilePath(path);
    let httpCode = _extractHttpCodeFromFileName(path);
    let mockData = {};

    if(isScriptMock) {
      path = find(paths.scripts);
      log.warn({'path':path},'Loading a script file');
      mockData = _loadMockData(paths.mocks);
    }

    let extension = _extractExtensionFromFileName(path);
    if(extension === 'js') {
      delete require.cache[require.resolve(path)];
      let jsMock = require(path);
      try {
        let response = new jsMock(_buildMockRequestObject(request), mockData);
        content = response.content;
        httpCode = response.httpCode || httpCode;
      } catch(e) {
        let message = 'The mock file is not valid';
        content = { 'error': message, 'e': util.inspect(e, false, 2, true) };
        notices.push(message);
      }
    }
    else {
      try {
        if(fileContent.length > 0) {
          content = JSON.parse(fileContent);
        } else {
          notices.push('The mock file is empty');
        }
      }
      catch(e) {
        httpCode = config.mock_file_invalid_http_code;
        let message = 'The mock file contains invalid JSON';
        content =  {'error': message};
        notices.push(message);
      }
    }

    let data = {
      rawContent: content,
      httpCode,
      notices
    }
    return data;
  }

  /**
   * Build an object containing the method, url (pathname) and query (queryString) from the request
   * @return object the built object
   */
  function _buildMockRequestObject(request) {

    let urlComponents = url.parse(request.url, true);

    return {
      'method': request.method,
      'url': urlComponents.pathname,
      'query': urlComponents.query
    }
  }

  /**
   * Extract the HTTP Code from the filename (just before the final extension)
   */
  function _extractHttpCodeFromFileName(filename) {
    let httpCode = 200;

    let matches = filename.match(/\.([0-9]{3})\.[a-z0-9]+$/i);
    if(matches != null) {
      httpCode = matches[1];
    }

    return httpCode;
  }

  /**
   * Extract the file extension from the filename
   */
  function _extractExtensionFromFileName(filename) {
    let extension = null;

    let matches = filename.match(/\.([a-z0-9]+)$/i);
    if(matches != null) {
      extension = matches[1];
    }

    return extension;
  }

  function _isScriptMockFilePath(filename) {
    let matches = filename.match(/\.script$/i);
    if(matches != null) {
      return true;
    }
    return false;
  }

  function _loadMockData(paths) {
    let dataPaths = _convertMockPathsToDataPaths(paths);
    let data = _loadMockDataFromDataPaths(dataPaths);
    return data;
  }

  function _convertMockPathsToDataPaths(paths) {
    let dataPaths = [];
    paths.forEach(function(element) {
      let lastSlashPosition = element.lastIndexOf('/');
      if(lastSlashPosition !== -1) {
        let dataPath = element.substring(0, lastSlashPosition + 1) + '@data.json';
        dataPaths.push(dataPath);
      }
    });
    return dataPaths;
  }

  function _loadMockDataFromDataPaths(dataPaths) {
    let data = {};
    let mockDataPath = find(dataPaths);
    if(mockDataPath !== null) {
      let fileContent = fs.readFileSync(mockDataPath, 'utf8');
      try {
        data = JSON.parse(fileContent);
      }
      catch(e) {

      }
    }
    return data;
  }

  // Expose
  return {
    find: find,
    load: load
  }

}

module.exports = FileLoaderService;
