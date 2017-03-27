'use strict';

function init() {
  let config = require('./configuration');
  let Logger = require('bunyan');

  let log = new Logger({
    name: config.logger.name,
    streams: [
      {
        stream: process.stdout,
        level: 'debug'
      },
      {
        type:  config.logger.type,
        path: config.logger.filepath,
        level: config.logger.level,
        period:  config.logger.period,
        count:  config.logger.count
      }
    ]
  });

  return log;
}

module.exports = init();