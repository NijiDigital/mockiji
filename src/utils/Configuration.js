'use strict';

const convict = require('convict');
const argv = require('yargs').argv;

const SETTINGS_SCHEMA = {
  port: {
    doc: 'Listening port',
    format: 'port',
    default: 8080,
    env: 'PORT',
    arg: 'port',
  },
  env: {
    doc: 'Application environment',
    format: String,
    default: 'dev',
    env: 'NODE_ENV',
    arg: 'env',
  },
  api_base_path: {
    doc: 'Base path of the mock files',
    format: String,
    default: './mocks',
    arg: 'api-base-path',
    env: 'API_BASE_PATH',
  },
  http_codes: {
    mock_file_not_found: {
      doc: 'HTTP code returned in case of a mock file that could not be found',
      format: 'int',
      default: 404,
    },
    mock_file_invalid: {
      doc: 'HTTP code return in case of an invalid mock file (that could not be parsed or interpreted)',
      format: 'int',
      default: 500,
    }
  },
  authorization_token: {
    doc: 'Authorization token type (base64)',
    format: String,
    default: '',
    arg: 'authorization-token',
    env: 'AUTHORIZATION_TOKEN',
  },
  dynamic_markers: {
    doc: 'Additionnals API path markers',
    format: Array,
    default: [],
    arg: 'api-dynamic-markers',
    env: 'API_DYNAMIC_MARKERS',
  },
  logs: {
    doc: 'Logs configuration as an object or an array of node-bunyan streams',
    format: Array,
    default: [{
      type:  'rotating-file',
      path: './logs/api-mockiji.log',
      level: 'warn',
      period:  '1d',
      count:  3,
    }]
  },
  middlewares: {
    doc: 'Additional Express middlewares',
    format: Array,
    default: []
  },
  silent: {
    doc: 'If set to true the default stdout log stream will not be created',
    format: Boolean,
    default: false,
    arg: 'silent',
  }
}

/**
 * This function creates and returns a new node-convict configuration.
 * It tries to load settings using the following sources :
 * - default values as defined in the SETTINGS_SCHEMA constant
 * - CLI arguments as defined in the SETTINGS_SCHEMA constant
 * - Environment variables as defined in the SETTINGS_SCHEMA constant
 * - inline configuration passed through the 'configuration' option
 * - JSON file whose path is provided in the 'configFile' option or in the '--config-file' CLI argument
 */
function initConfiguration({configuration, configFile} = {}) {
  // Initialize default configuration
  const config = convict(SETTINGS_SCHEMA);

  // If there is a provided configuration
  if (configuration) {
    config.load(configuration);
  }

  // Load an optional config file (e.g.: node app.js --config-file config.json)
  configFile = configFile || argv.configFile;
  if (configFile) {
    try {
      config.loadFile(configFile);
    } catch (e) {
      throw e;
    }
  }

  // Validate configuration
  config.validate({allowed: 'strict'});

  // Return convict object so it can directly be used
  // to retrieve settings.
  //
  //   Configuration.get('env');
  //
  return config;
}

module.exports = initConfiguration;
