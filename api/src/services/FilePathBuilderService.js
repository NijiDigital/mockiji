'use strict';

let Toolbox = require('../utils/Toolbox.js');
let util = require('util');
let fs = require('fs');

// Configuration
let env = require('../../config/env.json');
let config = require('../../config/'+ env.name +'.json');

// Logger
let bunyan = require('bunyan');
let log = bunyan.createLogger({name: config.logger.name});

/**
 * This Controller is for building the response
 */
let FilePathBuilderService = function() {

  /**
   * Build paths to load the mock file according to the method, url and queryString
   * @param method the request method
   * @param url the request url
   * @param queryString the request query string
   * @returns object
   */
  function generatePaths(method, url, queryString) {

    let mockURLs = [];

    // ../method.json
    // ../../method_lastElement.json
    // ../../../method_beforeLastElement_lastElement.json
    // etc.
    mockURLs = mockURLs.concat(_buildSpecialPaths(method, url, false));

    // ../@default/method.json
    // ../../@default/method_lastElement.json
    // ../../../@default/method_beforeLastElement_lastElement.json
    // etc.
    mockURLs = mockURLs.concat(_buildSpecialPaths(method, url, '@default'));

    // ../@scripts/method.js
    // ../../@scripts/method_lastElement.js
    // ../../../@scripts/method_beforeLastElement_lastElement.js
    // etc.
    let scriptURLs = _buildSpecialPaths(method, url, '@scripts');

    let toolbox = new Toolbox();
    let basePath = config.listen_to_these_api_base_urls.api;
    let absoluteMocksURLs = toolbox.buildAbsolutePaths(basePath, mockURLs);
    let absoluteScriptURLs = toolbox.buildAbsolutePaths(basePath, scriptURLs);

    return {
      mocks: absoluteMocksURLs,
      scripts: absoluteScriptURLs
    };
  }


  /**
   *
   */
  function _buildSpecialPaths(method, url, marker) {
    let mockURLs = [];

    let request = url.split('?');
    let path = request[0];

    let allParts = path.split('/');
    let partsCount = allParts.length;
    for(let p=0; p <= (partsCount-2); ++p) {
      let pathParts = [];
      let fileBodyName = [method];
      let fileExtensionName = '\\.*';
      for(let i=0; i<partsCount; ++i) {
          if(i < partsCount - (p)) {
              pathParts.push(allParts[i]);
          }
          else if(marker != false && i == partsCount - (p)) {
              pathParts.push(marker);
          }
          else {
              fileBodyName.push(allParts[i]);
          }
      }
      let url = pathParts.join('/') + '/' + fileBodyName.join('_') + fileExtensionName;
      mockURLs.push(url);
    }
    return mockURLs;
  }

  return {
    generatePaths
  }

}

module.exports = FilePathBuilderService;
