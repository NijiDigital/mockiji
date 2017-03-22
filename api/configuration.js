'use strict';

let configuration = function() {

  let merge = require('merge');
  let env = require('./config/env.json');

  let config;
  let configDefault;
  let configEnv;

  // First try load default configuration
  try {
    configDefault = require('./config/default.json');
    console.info('default config loaded');
  } catch(e) {
    console.error('ERROR - Impossible to load the default configuration file.');
    throw e;
  }

  // Try load env configuration
  try {
    let path = env.path + env.name +'.json';
    configEnv = require(path);
    console.info(env.name + ' config loaded');
  } catch(e) {
    console.error('ERROR - Impossible to load the env configuration file.');
    console.error('ERROR - Maybe the config/env.json file is not set to the right environment.');
    throw e;
  }

  // Merge default and env configuration
  config = merge(configDefault, configEnv);

  return config;
};

module.exports = configuration;