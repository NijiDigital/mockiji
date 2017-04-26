'use strict';

let util = require('util');
let fs = require('fs');
let URLRecomposerService = require('../services/URLRecomposerService.js');
let ProxyService = require('../services/ProxyService.js');
let MockService = require('../services/MockService.js');
let envConfig = require('../utils/configuration');

/**
 * This controller is for processing the requests and building the response
 */
let MockCtrl = function(log) {

  function _buildResponse(request, response) {
    let urlRecomposer = new URLRecomposerService();
    let url = urlRecomposer.recompose(request);

    log.debug({'url': url}, 'Incoming request');

    if (ProxyService.isUrlProxyfied(envConfig, url)) {
      ProxyService.doHttpCall(request, response, url, envConfig);
    } else {
      MockService.buildMockResponse(request, response, url, envConfig);
    }
  }

  return {
    buildResponse: _buildResponse
  }

};

module.exports = MockCtrl;
