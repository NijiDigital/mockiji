'use strict';

let util = require('util');
let URLRecomposerService = require('../services/URLRecomposerService.js');
let FilePathBuilderService = require('../services/FilePathBuilderService.js');
let FileLoaderService = require('../services/FileLoaderService.js');

// Configuration
let env = require('../../config/env.json');
let config = require('../../config/'+ env.name +'.json');

// Logger
let bunyan = require('bunyan');
let log = bunyan.createLogger({name: config.logger.name});

/**
 * This controller is for building the response
 */
let MockCtrl = function() {

  /**
   *
   * @param request
   * @param response
   */
  function _buildResponse(request, response) {

    let method = request.method.toLowerCase();
    let queryString = null;
    let httpCode = 201;
    let rawContent = null;

    // Get the URL
    let urlRecomposer = new URLRecomposerService();
    let url = urlRecomposer.recompose(request);
    log.info({'method': method, 'url': url}, 'Incoming request');

    // List every possible paths
    let pathBuilder = new FilePathBuilderService();
    let paths = pathBuilder.generatePaths(method, url, queryString);

    // Find the file to load and extract the content
    let fileLoader = new FileLoaderService();
    let fileToLoad = fileLoader.find(paths.mocks);

    let responseHeaders = {};

    if(fileToLoad !== null) {
      let fileData = fileLoader.load(fileToLoad, request, paths);
      rawContent = fileData.rawContent;
      httpCode = fileData.httpCode;
      responseHeaders['X-Mockiji-File'] = fileToLoad;
      responseHeaders['X-Mockiji-Notices'] = fileData.notices;
    } else {
      httpCode = config.mock_file_not_found_http_code;
      rawContent = {
        'errorCode': httpCode,
        'errorDescription': 'No mock file was found',
        'evaluatedMockFilePaths': paths.mocks
      };
      log.info(rawContent, '[Response] Not Found');
    }

    // Set Response Headers
    response.set(responseHeaders);

    // Send Response
    if(rawContent !== null) {
      response.status(httpCode).json(rawContent);
    } else {
      response.set('X-Mockiji-Empty-Response-Body', true);
      response.status(httpCode).send('');
    }
  }

  return {
    buildResponse: _buildResponse
  }

}

module.exports = MockCtrl;
