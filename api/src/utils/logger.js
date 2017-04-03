'use strict';

const config = require('./configuration');
const Logger = require('bunyan');
const path = require('path');
const fs = require('fs');

function init() {
  const loggerConfig = config.get('logger');

  // Create logs directory if it doesn't exist yet
  const logsPath = loggerConfig.filepath;

  if (logsPath) {
    const logsDirectory = path.dirname(logsPath);
    if (!fs.existsSync(logsDirectory)) {
      fs.mkdirSync(logsDirectory);
    }
  }

  const log = new Logger({
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

  return log;
}

module.exports = init();
