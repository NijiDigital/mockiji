#!/usr/bin/env node

'use strict';

// Server
const express = require('express');
const app = express();

// Server configuration
app.use(express.json());
app.use(express.urlencoded());
const http = require('http').Server(app);

// Create Configuration and Logger
const Configuration = require('./src/utils/Configuration')();
const Logger = require('./src/utils/Logger')({Configuration});

// Routes
const routes = require('./src/routes/index');
routes({Configuration, Logger, app});

// Launch server
const port = Configuration.get('port');
http.listen(port, function() {
  Logger.info("Server listening on port: " + port);
});

// Expose
module.exports = app;
