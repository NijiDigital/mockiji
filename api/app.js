'use strict';

// Server
const express = require('express');
const app = express();

// Server configuration
app.use(express.json());
app.use(express.urlencoded());
const http = require('http').Server(app);

// Configuration and logger
const config = require('./src/utils/configuration');
const log = require('./src/utils/logger');

// Routes
const routes = require('./src/routes/index');
routes(app, log);

// Launch server
const port = config.get('port');
http.listen(port, function() {
  log.info("Server listening on port: " + port);
});

// Expose
module.exports = app;
