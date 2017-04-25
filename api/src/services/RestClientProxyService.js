'use strict';
let http = require('http');
let log = require('../utils/logger');

let RestClientProxyService = function() {};

RestClientProxyService.doHttpCall = function (request, response, url, proxyConfig) {
  log.debug("[PROXIFIED URL] HTTP CALL :" + url);

  var options = {
    host: proxyConfig["host"],
    port: proxyConfig["port"],
    path: url,
    method: request.method
  };

  http.request(options, function(httpRestResponse) {
    var responseAsString = '';
    httpRestResponse.setEncoding('utf8');
    httpRestResponse.on('data', function (chunk) {
      responseAsString += chunk;
    });
    httpRestResponse.on('end', function() {
      response.set(httpRestResponse.headers);
      response.status(httpRestResponse.statusCode);
      response.send(responseAsString);
    });
  }).end();
};

module.exports = RestClientProxyService;
