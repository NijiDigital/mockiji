'use strict';

const config = require('./configuration');
const Logger = require('bunyan');

function init() {
  const loggerConfig = config.get('logger');

  let log = new Logger({
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
