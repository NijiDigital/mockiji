'use strict';

const Toolbox = require('../utils/Toolbox.js');
const util = require('util');
const fs = require('fs');

// Configuration and logger
const config = require('../utils/configuration');
const log = require('../utils/logger');

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
    // @default/../method.json
    // ../../@default/method_lastElement.json
    // ../@default/../method_lastElement.json
    // @default/../../method_lastElement.json
    // ../../../@default/method_beforeLastElement_lastElement.json
    // ../../@default/../method_beforeLastElement_lastElement.json
    // ../@default/../../method_beforeLastElement_lastElement.json
    // @default/../../../method_beforeLastElement_lastElement.json
    // etc.
    mockURLs = mockURLs.concat(_buildSpecialPaths(method, url, '@default'));

    // ../@scripts/method.js
    // @scripts/../method.js
    // ../../@scripts/method_lastElement.js
    // ../@scripts/../method_lastElement.js
    // @scripts/../../method_lastElement.js
    // ../../../@scripts/method_beforeLastElement_lastElement.js
    // ../../@scripts/../method_beforeLastElement_lastElement.js
    // ../@scripts/../../method_beforeLastElement_lastElement.js
    // @scripts/../../../method_beforeLastElement_lastElement.js
    // etc.
    let scriptURLs = _buildSpecialPaths(method, url, '@scripts');

    let toolbox = new Toolbox();
    let appRootPath = require('path').dirname(require.main.filename) + '/';
    let basePath = toolbox.buildAbsolutePaths(appRootPath, [config.get('api_base_path')]);
    let absoluteMocksURLs = toolbox.buildAbsolutePaths(basePath, mockURLs);
    let absoluteScriptURLs = toolbox.buildAbsolutePaths(basePath, scriptURLs);

    return {
      mocks: absoluteMocksURLs,
      scripts: absoluteScriptURLs
    };
  }


  /**
   * Build paths to load the mock file according to the method, url and queryString
   * @param method the request method
   * @param url the request url
   * @param queryString the request query string
   * @returns object
   */
  function _buildSpecialPaths(method, url, marker) {
    let mockURLs = [];

    let request = url.split('?');
    let path = request[0];

    let allParts = path.split('/');
    let partsCount = allParts.length;
    // allParts : Array form : [elmt1, elmt2, elmt3, elmt4, elmt5, elmt6]
    // This algorithm splits it into 2 arrays, for example :
    // pathParts : [elmt1, elmt2, elmt3, elmt4]
    // fileBodyName : [elmt5, elmt6]
    // Then joins pathParts with "/" and fileBodyName with "_" to form one full path
    // url : elmt1/elmt2/elmt3/elmt4/elmt5_elmt6
    // p : separator between pathParts and fileBodyName
    for(let p=0; p <= (partsCount-2); ++p) {
      // j : allows to replace every element of the path with the specified marker if the marker is specified
      for (let j=(partsCount-p-1); j >= 1; --j) {
        let pathParts = [];
        let fileBodyName = [method];
        let fileExtensionName = '\\.*';
        // Go through allParts and split it according to p (and j if marker is defined)
        for(let i=0; i<partsCount; ++i) {
          if(marker != false && i == j) {
            pathParts.push(marker);
          }
          else if(i < partsCount - (p)) {
            pathParts.push(allParts[i]);
          }
          else {
            fileBodyName.push(allParts[i]);
          }
        }
        let url = pathParts.join('/') + '/' + fileBodyName.join('_') + fileExtensionName;
        mockURLs.push(url);
        // if no marker is defined, then there is no use about incrementing j so we break the "j" for loop
        if (!marker) {
          break;
        }
      }
    }
    return mockURLs;
  }

  return {
    generatePaths
  }

}

module.exports = FilePathBuilderService;
