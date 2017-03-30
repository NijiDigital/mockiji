'use strict';

/**
 * This function loads the default configuration (default.json), then checks if
 * an environment configuration has to be fetch by checking the "path" value
 * (env.json).
 *
 * If the path is not blank, if will load the environment configuration file
 * from this path and the environment "name"
 */
let loadConfigs = function() {

  let merge = require('merge');
  let appRootPath = require('path').dirname(require.main.filename);
  let toolbox = require('./Toolbox.js')();

  let env;
  let defaultConfig;
  let envConfigFilePath;
  let envConfig;

  // Load the env.json file
  let envPath = appRootPath + '/config/env.json';
  try {
    env = require(envPath);
    console.log('Env file from %s file has been found and loaded', envPath);
    envConfigFilePath = toolbox.buildEnvConfigFilePath(appRootPath, env);
  } catch (e) {
    console.error('ERROR - Impossible to load the environment configuration file.');
    console.error('The environment configuration file must be at ' + envPath);
    throw e;
  }

  // Load default configuration
  let defaultConfigPath = appRootPath + '/config/default.json';
  try {
    defaultConfig = require(defaultConfigPath);
    if (env.path) {
      console.log('Config from %s file is loaded and will be merge with %s', defaultConfigPath, envConfigFilePath);
    } else {
      console.info('Config from %s file is loaded and will be used as is.', defaultConfigPath);
    }
  } catch (e) {
    console.error('ERROR - Impossible to load the default configuration file');
    console.error('The default configuration file must be at ' + defaultConfigPath);
    throw e;
  }

  // Load the env configuration and merge it over the default one
  if (env.path) {
    try {
      envConfig = require(envConfigFilePath);
      console.info('Config from %s file is loaded and will be merged over %s', envConfigFilePath, defaultConfigPath);
    } catch (e) {
      console.error('ERROR - Impossible to load the env configuration file (%s) defined with env.json', envConfigFilePath);
      console.error('Please check the "path" value in %s file.', envPath);
      throw e;
    }
  }

  // Merge default and env configuration
  return merge(defaultConfig, envConfig);
}

module.exports = loadConfigs();
