'use strict';

// Server
let express = require('express');
let app = express();

// Configuration
let configuration = require('./configuration');
let config = configuration();

// Server configuration
app.use(express.json());
app.use(express.urlencoded());
let http = require('http').Server(app);

// Logger
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

// Routes
let routes = require('./src/routes/index');
routes(app, log);

// Launch server
http.listen(config.app_listening_port, function() {
  log.info("Server listening on port: " + config.app_listening_port);
});

// Expose
module.exports = app;
