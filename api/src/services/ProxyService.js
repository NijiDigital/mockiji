'use strict';

let fs = require('fs');
let http = require('http');
let log = require('../utils/logger');

let ProxyService = function() {};

ProxyService.isUrlProxyfied = function(envConfig, testedUrl) {
  let urls = envConfig["proxy"]["urls"];
  let result = false;
  for (let urlPatternProperty in urls) {
    let urlMatching = new RegExp(urlPatternProperty).test(testedUrl);
    if (urlMatching) {
      result = urls[urlPatternProperty];
      break;
    }
  };
  return result;
};

ProxyService.doHttpCall = function (request, response, url, envConfig) {
  log.debug("[PROXIFIED URL] HTTP CALL :" + url);
  var proxyConfig = envConfig["proxy"];

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

module.exports = ProxyService;
