'use strict';

const bunyan = require('bunyan');
const path = require('path');
const fs = require('fs');

function Logger({Configuration}) {
  const loggerConfig = Configuration.get('logger');

  // Create logs directory if it doesn't exist yet
  const logsPath = loggerConfig.filepath;

  if (logsPath) {
    const logsDirectory = path.dirname(logsPath);
    if (!fs.existsSync(logsDirectory)) {
      fs.mkdirSync(logsDirectory);
    }
  }

  // Return bunyan object so it can directly be used
  // to log things.
  //
  //   Logger.log('foo');
  //
  return bunyan.createLogger({
    name: loggerConfig.name,
    streams: [
      {
        stream: process.stdout,
        level: 'debug'
      },
      {
        type:  loggerConfig.type,
        path: loggerConfig.filepath,
        level: loggerConfig.level,
        period:  loggerConfig.period,
        count:  loggerConfig.count
      }
    ]
  });
}

module.exports = Logger;
