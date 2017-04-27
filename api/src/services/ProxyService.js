'use strict';

let http = require('http');
let log = require('../utils/logger');

/**
 * This service is about proxyfing some requests to another server
 */
let ProxyService = function() {};

/**
 * Returns true if the testedUrl has to be proxyfied
 * It tests the testedUrl against some patterns from the configuration
 */
ProxyService.isUrlProxyfied = function(envConfig, testedUrl) {
  let proxyConfig = envConfig['proxy'];
  let patterns = proxyConfig['urls'] || [];
  let proxyEnabledPatterns = Object.keys(patterns).filter(function(pattern) {
    return patterns[pattern];
  });
  for (let pattern of proxyEnabledPatterns) {
    if (new RegExp(pattern).test(testedUrl)) {
      return true;
    }
  };
  return false;
};

/**
 * Proxify an incoming request to another server
 * The destination server is set by the configuration
 */
ProxyService.doHttpCall = function (request, response, url, envConfig) {

  let proxyConfig = envConfig['proxy'] || [];

  // Proxy request options
  let options = {
    host: proxyConfig['host'],
    port: proxyConfig['port'],
    path: url,
    method: request.method
  };

  let proxifiedUrlString = [options.method, ' http://', options.host,':',options.port,options.path].join('');
  log.debug('[PROXIFIED URL] Original request [' + url + '] => Transformed request [' + proxifiedUrlString + ']');

  let proxyRequest = http.request(options, function(httpRestResponse) {
    let responseAsString = '';
    httpRestResponse.setEncoding('utf8');
    httpRestResponse.on('data', function(chunk) {
      responseAsString += chunk;
    });
    httpRestResponse.on('end', function() {
      response.set(httpRestResponse.headers);
      response.status(httpRestResponse.statusCode);
      response.send(responseAsString);
    });
  });

  proxyRequest.on('error', function(error) {
    if (error.code === 'ENOTFOUND') {
      log.error('Bad proxy configuration: host "' +  error.hostname + '" not found, details: ', error);
    } else {
      log.error('Unknwon proxy error: ', error);
    }
    response.status(500);
    response.send('');
  });

  proxyRequest.end();
};

module.exports = ProxyService;
