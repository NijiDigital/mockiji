'use strict';

let fs = require('fs');
let log = require('../utils/logger');

let ProxyConfig = function() {};

const CONFIG_FILE = "/config/proxyConfig.json";
const DEFAULT_CONFIG = {
  "proxy" : {}
};

ProxyConfig.load = function () {
  let configPath = process.cwd() + CONFIG_FILE;
  let config;
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log("Proxy configuration from '" + configPath + "' file has been found and loaded");
  } catch (e) {
    console.log("No 'proxyConfig.json' file found (or invalid), using default empty configuration, all urls will be mocked");
    config = DEFAULT_CONFIG;
  };
  return config;
};

ProxyConfig.isUrlProxyfied = function(proxyConfig, testedUrl) {
  let urls = proxyConfig["proxy"];
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

module.exports = ProxyConfig;
