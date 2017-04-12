'use strict';

const util = require('util');
const fs = require('fs');
const merge = require('merge');
const url = require('url');
const glob = require('glob-all');
const jsonfile = require('jsonfile');

/**
 * UTF8 Encoding
 */
const UTF8 = 'utf8';

/**
 * This service is for loading the right file
 */
class FileLoaderService {
  /**
   * Constructor.
   */
  constructor({Configuration, Logger}) {
    this.Configuration = Configuration;
    this.Logger = Logger;
  }

  /**
   * Find the right file to load
   */
  find(paths, unlimited) {
    let files = [];

    let fileMatch = false;
    paths.forEach((element) => {
      if (fileMatch && !unlimited) {
        return;
      }

      let candidateFile = glob.sync(element);
      if(candidateFile.length > 0) {
        this.Logger.debug({'files': files}, `Mock file found: ${candidateFile[0]}`);
        files.push(candidateFile[0]);
        fileMatch = true;
      }
    });

    if (unlimited) {
      this.Logger.debug({'files': files}, `${files.length} matching file(s) found, returning all of them`);
      return files;
    }

    if (files.length > 0) {
      this.Logger.debug({'files': files}, `${files.length} matching file(s) found, returning "${files[0]}"`);
      return files[0];
    }

    return null;
  }

  /**
   * Load the file located at the path
   */
  load(pPath, request, paths) {
    let fileContent = fs.readFileSync(pPath, 'utf8');
    let content = null;
    let notices = [];
    let path = null;
    let extension = null;
    let location = null;

    let isScriptMock = this._isScriptMockFilePath(pPath);
    let httpCode = this._extractHttpCodeFromFileName(pPath);
    let mockData = {};
    let delay = 1;

    if(isScriptMock) {
      let scriptFilePath = pPath;
      mockData = this._loadMockData(scriptFilePath, paths.mocks);
      path = this.find(paths.scripts);
      this.Logger.debug(`Loading script file "${path}"`);
    }
    else {
      path = pPath;
    }

    extension = this._extractExtensionFromFileName(path);
    if(extension === 'js') {

      // Load the possible memory file
      let memory = this._loadMemoryFile(path);

      delete require.cache[require.resolve(path)];
      let jsMock = require(path);

      try {
        let response = new jsMock(this._buildMockRequestObject(request), mockData, memory);
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
          this._updateMemoryFile(path, response.memory);
        }

      } catch(e) {
        let message = 'The mock file is not valid (' + path + ')';
        content = { 'error': message, 'e': util.inspect(e, false, 2, true) };
        notices.push(message);
      }
    }
    else if(extension === 'html') {
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
        httpCode = this.Configuration.get('http_codes.mock_file_invalid');
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
  _loadMemoryFile(mockPath) {
    let memoryPath = mockPath.replace('.js','.memory.json');
    try {
      return jsonfile.readFileSync(memoryPath);
    } catch(e) {
      this.Logger.debug({'exception': e}, `Could not open memory file "${memoryPath}"`);
      return {};
    }
  }

  /**
   * Update (or create) the memory file fitting the mockPath with the memory content
   */
  _updateMemoryFile(mockPath, memory) {
    let memoryPath = mockPath.replace('.js','.memory.json');
    try {
      jsonfile.writeFileSync(memoryPath, memory, {spaces:2});
      this.Logger.info(`Wrote into memory file "${memoryPath}"`);
    } catch(e) {
      this.Logger.error({'exception': e}, `Could not write into memory file "${memoryPath}"`);
    }
  }

  /**
   * Build an object containing the method, url (pathname) and query (queryString) from the request
   * @return object the built object
   */
  _buildMockRequestObject(request) {
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
  _extractHttpCodeFromFileName(filename) {
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
  _extractExtensionFromFileName(filename) {
    let extension = null;

    let matches = filename.match(/\.([a-z0-9]+)$/i);
    if(matches != null) {
      extension = matches[1];
    }

    return extension;
  }

  _isScriptMockFilePath(filename) {
    let matches = filename.match(/\.script$/i);
    if(matches != null) {
      return true;
    }
    return false;
  }

  _loadMockData(path, paths) {
    let dataFileNames = this._extractDataFileNamesFromScriptFile(path);
    let dataPaths = this._convertMockPathsToDataPaths(paths, dataFileNames);
    let data = this._loadMockDataFromDataPaths(dataPaths);
    return data;
  }

  _extractDataFileNamesFromScriptFile(path) {
    let fileContent = fs.readFileSync(path, UTF8);
    let paths = fileContent.trim().split(/\r?\n/);
    return paths;
  }

  _convertMockPathsToDataPaths(paths, files) {
    let dataPaths = {};

    files.forEach((file) => {
      dataPaths[file] = [];
    });

    paths.forEach((path) => {
      let lastSlashPosition = path.lastIndexOf('/');
      if(lastSlashPosition !== -1) {
        files.forEach((file) => {
          let dataDefaultPath = [path.substring(0, lastSlashPosition), '@default/@data', file].join('/');
          dataPaths[file].push(dataDefaultPath);
          let dataPath = [path.substring(0, lastSlashPosition), '@data', file].join('/');
          dataPaths[file].push(dataPath);
        })
      }
    });
    return dataPaths;
  }

  _loadMockDataFromDataPaths(dataPaths) {
    let data = {};
    for(let file in dataPaths) {
      let paths = dataPaths[file];
      let mockDataPaths = this.find(paths, true);
      if(mockDataPaths !== null) {
        mockDataPaths.reverse().forEach((mockDataPath) => {
          let fileContent = fs.readFileSync(mockDataPath, 'utf8');
          try {
            let jsonContent = JSON.parse(fileContent);
            data = merge.recursive(true, data, jsonContent);
          }
          catch (e) {
            this.Logger.error({'exception': e}, `Could not parse mock file "${mockDataPath}"`);
          }
        });
      }
    }
    return data;
  }
}

module.exports = FileLoaderService;
