'use strict';

const util = require('util');
const URLRecomposerService = require('../services/URLRecomposerService.js');
const FilePathBuilderService = require('../services/FilePathBuilderService.js');
const FileLoaderService = require('../services/FileLoaderService.js');

/**
 * This controller is for processing the requests and building the response
 */
let MockCtrl = function({Configuration, Logger}) {
  const urlRecomposer = new URLRecomposerService({Configuration, Logger});
  const pathBuilder = new FilePathBuilderService({Configuration, Logger});
  const fileLoader = new FileLoaderService({Configuration, Logger});

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
    let extension = 'json';
    let location = null;
    let delay = 1;

    // Get the URL
    let url = urlRecomposer.recompose(request);
    Logger.debug({'method': method, 'url': url}, 'Incoming request');

    // List every possible paths
    let paths = pathBuilder.generatePaths(method, url, queryString);

    // Find the file to load and extract the content
    let fileToLoad = fileLoader.find(paths.mocks);

    let responseHeaders = {};

    if (fileToLoad !== null) {
      let fileData = fileLoader.load(fileToLoad, request, paths);
      rawContent = fileData.rawContent;
      httpCode = fileData.httpCode;
      extension = fileData.extension;
      location = fileData.location;
      delay = fileData.delay;
      responseHeaders['X-Mockiji-File'] = fileToLoad;
      responseHeaders['X-Mockiji-Notices'] = fileData.notices;
      responseHeaders['Cache-Control'] = 'no-cache';
      if (location) {
        responseHeaders['Location'] = location;
      }
      Logger.info({'method': method, 'url': url}, '[Response] ' + httpCode);
    } else {
      httpCode = Configuration.get('http_codes.mock_file_not_found');
      rawContent = {
        'errorCode': httpCode,
        'errorDescription': 'No mock file was found',
        'evaluatedMockFilePaths': paths.mocks
      };
      Logger.info(rawContent, '[Response] Not Found');
    }

    // Set Response Headers
    response.set(responseHeaders);

    // Send Response
    setTimeout(function() {
      if(rawContent !== null && extension === 'html') {
        response.status(httpCode).send(rawContent);
      } else if(rawContent !== null) {
        response.status(httpCode).json(rawContent);
      } else {
        response.set('X-Mockiji-Empty-Response-Body', true);
        response.status(httpCode).send('');
      }
    }, delay);
  }

  return {
    buildResponse: _buildResponse
  }

};

module.exports = MockCtrl;
