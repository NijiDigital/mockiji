'use strict';

let util = require('util');
let fs = require('fs');
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
        log.info("FILE MATCH! : " + element + " - " + util.inspect(files));
        fileMatch = true;
      } else {
        log.info({"rootPath":element});
      }
    });

    if(files.length > 0) {
      log.warn("Multiple files found, selecting the first one: " + files);
      let file = files[0];
      return file;
    }

    return null;
  }

  /**
   * Load the file located at the path
   */
  function load(path, request) {

    var fileContent = fs.readFileSync(path, 'utf8');
    let content = null;
    let notices = [];

    let httpCode = _extractHttpCodeFromFileName(path);
    let extension = _extractExtensionFromFileName(path);
    log.warn({"ext":extension},"Extension");

    if(extension === 'js') {
      delete require.cache[require.resolve(path)];
      let jsMock = require(path);
      let response = new jsMock(request);
      content = response.content;
      httpCode = response.httpCode || httpCode;
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
        content =  {'error':message};
        notices.push(message);
      }
    }

    let data = {
      rawContent: content,
      httpCode: httpCode,
      notices: notices
    }
    return data;
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

  // Expose
  return {
    find: find,
    load: load
  }

}

module.exports = FileLoaderService;
