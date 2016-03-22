'use strict';

// Server
let express = require('express');
let app = express();

// Configuration
let env = require('./config/env.json');
let config = require('./config/'+ env.name +'.json');

// Server configuration
app.use(express.json());
app.use(express.urlencoded());
let http = require('http').Server(app);

// Logger
let Logger = require('bunyan');
let log = new Logger({
  name: 'api-mockiji',
  streams: [
    {
      stream: process.stdout,
      level: 'debug'
    },
    {
      path: 'logs/api-mockiji.log',
      level: 'trace'
    }
  ]
});

// Routes
let routes = require('./src/routes/index');
routes(app);

// Launch server
http.listen(config.app_listening_port, function() {
    log.info("Server listening on port: " + config.app_listening_port);
});

// Expose
module.exports = app;
