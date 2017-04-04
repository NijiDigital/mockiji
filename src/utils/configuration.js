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
  logger: {
    name: {
      doc: 'Name of the logger',
      format: String,
      default: 'api-mockiji',
    },
    filepath: {
      doc: 'Path of the log file',
      format: String,
      default: './logs/api-mockiji.log',
      env: 'LOGGER_PATH',
      arg: 'logger-path',
    },
    level: {
      doc: 'Logs level',
      format: ['trace', 'debug', 'info', 'warn', 'error', 'fatal'],
      default: 'warn',
      env: 'LOGGER_LEVEL',
      arg: 'logger-level',
    },
    type: {
      doc: 'Logs stream type',
      format: ['stream', 'file', 'rotating-file', 'raw'],
      default: 'rotating-file',
    },
    period: {
      doc: 'Logs rotating file period',
      format: String,
      default: '1d',
    },
    count: {
      doc: 'How many log files are kept in rotating mode',
      format: 'int',
      default: 3,
    }
  },
  authorization_token: {
    // TODO Add a better explanation for authorization_token parameter
    doc: 'Authorization token regexes',
    format: '*',
    default: {},
  }
}

/**
 * This function loads the default configuration (default.json), then checks if
 * an environment configuration has to be fetch by checking the "path" value
 * (env.json).
 *
 * If the path is not blank, if will load the environment configuration file
 * from this path and the environment "name"
 */
function loadConfigs() {
  // Initialize default configuration
  console.info('Loading default configuration...');
  const config = convict(SETTINGS_SCHEMA);

  // Load an optional config file (e.g.: node app.js --config-file config.json)
  const configFile = argv.configFile;
  if (configFile) {
    console.info(`Loading configuration file "${configFile}"...`);
    try {
      config.loadFile(configFile);
    } catch (e) {
      console.error(`Error: Could not load configuration file "${configFile}"`);
      throw e;
    }
  }

  // Validate configuration
  console.info('Validating configuration...')
  config.validate({allowed: 'strict'});

  // Return convict object so it can directly be used
  // to retrieve settings.
  //
  //   const config = require('./configuration');
  //   config.get('env');
  //
  console.info(`Configuration loaded successfuly!`);
  return config;
};

module.exports = loadConfigs();