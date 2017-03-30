'use strict';

let util = require('util');
let fs = require('fs');
let merge = require('merge');
let url = require('url');
let glob = require('glob-all');
let jsonfile = require('jsonfile');

// Configuration and logger
let config = require('../utils/configuration');
let log = require('../utils/logger');

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
      if (fileMatch && !unlimited) {
        return;
      }

      let candidateFile = glob.sync(element);
      if(candidateFile.length > 0) {
        log.debug({'files': util.inspect(files), 'key': element}, 'FILE MATCH!');
        files.push(candidateFile[0]);
        fileMatch = true;
      }
    });

    if (unlimited) {
      log.debug('Multiple files found, return all:', files);
      return files;
    }

    if (files.length > 0) {
      log.debug('Multiple files found, selecting the first one: ' + files[0]);
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
    let extension = null;
    let location = null;

    let isScriptMock = _isScriptMockFilePath(pPath);
    let httpCode = _extractHttpCodeFromFileName(pPath);
    let mockData = {};
    let delay = 1;

    if(isScriptMock) {
      let scriptFilePath = pPath;
      mockData = _loadMockData(scriptFilePath, paths.mocks);
      path = find(paths.scripts);
      log.info({'path':path},'Loading a script file');
    }
    else {
      path = pPath;
    }

    extension = _extractExtensionFromFileName(path);
    if(extension === 'js') {

      // Load the possible memory file
      let memory = _loadMemoryFile(path);

      delete require.cache[require.resolve(path)];
      let jsMock = require(path);

      try {
        let response = new jsMock(_buildMockRequestObject(request), mockData, memory);
        content = response.content;
        httpCode = response.httpCode || httpCode;
        if (response.hasOwnProperty('extension')) {
          extension = response.extension;
        }
        if (response.hasOwnProperty('location')) {
          location = response.location;
        }
        delay = response.delay || delay;

        // Save memory if returned
        if(response.memory) {
          _updateMemoryFile(path, response.memory);
        }

      } catch(e) {
        let message = 'The mock file is not valid (' + path + ')';
        content = { 'error': message, 'e': util.inspect(e, false, 2, true) };
        notices.push(message);
      }
    }
    else if(extension === 'html') {
      log.warn(fileContent);
      content = fileContent;
      httpCode = 200;
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
      extension: extension,
      location,
      httpCode,
      delay,
      notices
    };
    return data;
  }

  /**
   * Check if the memory file fitting the mockPath exist and returns its content
   * @return object from the memory file or {} if the file does not exist
   */
  function _loadMemoryFile(mockPath) {
    let memoryPath = mockPath.replace('.js','.memory.json');
    try {
      return jsonfile.readFileSync(memoryPath);
    } catch(e) {
      log.info(memoryPath, 'this memory file does not exist');
      return {};
    }
  }

  /**
   * Update (or create) the memory file fitting the mockPath with the memory content
   */
  function _updateMemoryFile(mockPath, memory) {
    let memoryPath = mockPath.replace('.js','.memory.json');
    try {
      log.info(memoryPath, 'this memory file can be created');
      jsonfile.writeFileSync(memoryPath, memory, {spaces:2});
    } catch(e) {
      log.error(memoryPath, 'this memory file cannot be created');
    }
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
