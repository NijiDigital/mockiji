'use strict';

let util = require('util');
let fs = require('fs');
let URLRecomposerService = require('../services/URLRecomposerService.js');
let RestClientProxyService = require('../services/RestClientProxyService.js');
let ProxyConfigService = require('../services/ProxyConfigService.js');
let MockService = require('../services/MockService.js');
let envConfig = require('../utils/configuration');
let proxyConfig = ProxyConfigService.load();

/**
 * This controller is for processing the requests and building the response
 */
let MockCtrl = function(log) {

  function _buildResponse(request, response) {
    let urlRecomposer = new URLRecomposerService();
    let url = urlRecomposer.recompose(request);

    log.debug({'url': url}, 'Incoming request');

    if (ProxyConfigService.isUrlProxyfied(proxyConfig, url)) {
      RestClientProxyService.doHttpCall(request, response, url, proxyConfig);
    } else {
      MockService.buildMockResponse(request, response, url, envConfig);
    }
  }

  return {
    buildResponse: _buildResponse
  }

};

module.exports = MockCtrl;
