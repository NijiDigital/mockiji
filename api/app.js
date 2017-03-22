'use strict';

// Server
let express = require('express');
let app = express();

// Server configuration
app.use(express.json());
app.use(express.urlencoded());
let http = require('http').Server(app);

// Configuration and logger
let config = require('./src/utils/configuration');
let log = require('./src/utils/logger');

// Routes
let routes = require('./src/routes/index');
routes(app, log);

// Launch server
http.listen(config.app_listening_port, function() {
  log.info("Server listening on port: " + config.app_listening_port);
});

// Expose
module.exports = app;
