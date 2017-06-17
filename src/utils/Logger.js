'use strict';

const bunyan = require('bunyan');
const path = require('path');
const fs = require('fs');
const PrettyLogStream = require('./PrettyLogStream');

function initLogger({Configuration}) {
  const environment = Configuration.get('env');
  const loggerConfig = Configuration.get('logs');
  const silent = Configuration.get('silent');

  const streams = []

  // If Mockiji is not in silent mode, add a stdout stream
  if (!silent) {
    streams.push({
      stream: new PrettyLogStream(),
      level: (environment === 'dev') ? 'debug' : 'info',
    });
  }

  // Create log streams based on the configuration
  for (let stream of loggerConfig) {
    streams.push(stream);
  }

  // Create logs directory for each stream if needed
  for (let stream of streams) {
    if (stream.path) {
      const logsDirectory = path.dirname(stream.path);
      if (!fs.existsSync(logsDirectory)) {
        fs.mkdirSync(logsDirectory);
      }
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
