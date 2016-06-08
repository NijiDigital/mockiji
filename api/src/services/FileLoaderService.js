'use strict';

let util = require('util');
let fs = require('fs');
let merge = require('merge');
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
   * UTF8 Encoding
   */
  const UTF8 = 'utf8';

  /**
   * Find the right file to load
   */
  function find(paths, unlimited) {

    let files = [];

    let fileMatch = false;
    paths.forEach(function(element) {
      if(fileMatch && !unlimited) {
        return;
      }

      let candidateFile = glob.sync(element);
      if(candidateFile.length > 0) {
        log.info({'files': util.inspect(files), 'key': element}, 'FILE MATCH!');
        files.push(candidateFile[0]);
        fileMatch = true;
      }
    });

    if (unlimited) {
      log.info('Multiple files found, return all:', files);
      return files;
    }

    if(files.length > 0) {
      log.info('Multiple files found, selecting the first one: ' + files[0]);
      return files[0];
    }

    return null;
  }

  /**
   * Load the file located at the path
   */
  function load(pPath, request, paths) {

    let fileContent = fs.readFileSync(pPath, 'utf8');
    let content = null;
    let notices = [];
    let path = null;

    let isScriptMock = _isScriptMockFilePath(pPath);
    let httpCode = _extractHttpCodeFromFileName(pPath);
    let mockData = {};

    if(isScriptMock) {
      let scriptFilePath = pPath;
      mockData = _loadMockData(scriptFilePath, paths.mocks);
      path = find(paths.scripts);
      log.info({'path':path},'Loading a script file');
    }
    else {
      path = pPath;
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
        let message = 'The mock file is not valid (' + path + ')';
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
      'body': request.body,
      'headers': request.headers,
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

  function _loadMockData(path, paths) {
    let dataFileNames = _extractDataFileNamesFromScriptFile(path);
    let dataPaths = _convertMockPathsToDataPaths(paths, dataFileNames);
    let data = _loadMockDataFromDataPaths(dataPaths);
    return data;
  }

  function _extractDataFileNamesFromScriptFile(path) {
    let fileContent = fs.readFileSync(path, UTF8);
    let paths = fileContent.trim().split(/\r?\n/);
    return paths;
  }

  function _convertMockPathsToDataPaths(paths, files) {
    let dataPaths = {};

    files.forEach(function(file) {
      dataPaths[file] = [];
    });

    paths.forEach(function(path) {
      let lastSlashPosition = path.lastIndexOf('/');
      if(lastSlashPosition !== -1) {
        files.forEach(function(file) {
          let dataDefaultPath = [path.substring(0, lastSlashPosition), '@default/@data', file].join('/');
          dataPaths[file].push(dataDefaultPath);
          let dataPath = [path.substring(0, lastSlashPosition), '@data', file].join('/');
          dataPaths[file].push(dataPath);
        })
      }
    });
    return dataPaths;
  }

  function _loadMockDataFromDataPaths(dataPaths) {
    let data = {};
    for(let file in dataPaths) {
      let paths = dataPaths[file];
      let mockDataPaths = find(paths, true);
      if(mockDataPaths !== null) {
        mockDataPaths.reverse().forEach(function(mockDataPath) {
          let fileContent = fs.readFileSync(mockDataPath, 'utf8');
          try {
            let jsonContent = JSON.parse(fileContent);
            data = merge.recursive(true, data, jsonContent);
          }
          catch (e) {
            log.warn('Error parsing file: ', mockDataPath);
          }
        });
      }
    }
    return data;
  }

  // Expose
  return {
    find,
    load
  }

}

module.exports = FileLoaderService;
