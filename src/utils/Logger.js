'use strict';

const bunyan = require('bunyan');
const argv = require('yargs').argv;

function initLogger({Configuration}) {
  const environment = Configuration.get('env');
  const loggerConfig = Configuration.get('logs');

  const streams = []

  // If Mockiji is not in silent mode, add a stdout stream
  if (!argv.silent) {
    streams.push({
      stream: process.stdout,
      level: (environment === 'dev') ? 'debug' : 'info',
    });
  }

  // Create log streams based on the configuration
  if (loggerConfig) {
    if (Array.isArray(loggerConfig)) {
      for (let stream of loggerConfig) {
        streams.push(stream);
      }
    } else {
      streams.push(loggerConfig);
    }
  }

  // Return bunyan object so it can directly be used
  // to log things.
  //
  //   Logger.log('foo');
  //
  return bunyan.createLogger({
    name: 'mockiji',
    streams
  });
}

module.exports = initLogger;
