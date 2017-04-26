'use strict';
let http = require('http');
let log = require('../utils/logger');
let FileLoaderService = require('../services/FileLoaderService.js');
let FilePathBuilderService = require('../services/FilePathBuilderService.js');

let MockService = function() {};

MockService.buildMockResponse = function (request, response, url, envConfig) {
  let queryString = null;
  let httpCode = 201;
  let rawContent = null;
  let extension = 'json';
  let location = null;
  let delay = 1;
  let method = request.method.toLowerCase();

  // List every possible paths
  let pathBuilder = new FilePathBuilderService();
  let paths = pathBuilder.generatePaths(method, url, queryString);

  // Find the file to load and extract the content
  let fileLoader = new FileLoaderService();
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
    log.info({'method': method, 'url': url}, '[Response] ' + httpCode);
  } else {
    httpCode = envConfig.mock_file_not_found_http_code;
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
};

module.exports = MockService;
