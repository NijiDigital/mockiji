'use strict';

const express = require('express');

class Mockiji {
  constructor(options = {}) {
    // Create Configuration and Logger
    this.Configuration = require('./utils/Configuration')(options);
    this.Logger = require('./utils/Logger')({
      Configuration: this.Configuration
    });
  }

  start() {
    // Server
    const app = express();

    // Server configuration
    app.use(express.json());
    app.use(express.urlencoded());
    const http = require('http').Server(app);

    // Routes
    const routes = require('./routes/index');
    routes({
      Configuration: this.Configuration,
      Logger: this.Logger,
      app
    });

    // Launch server
    const port = this.Configuration.get('port');
    http.listen(
      port,
      () => { this.Logger.info("Server listening on port: " + port); }
    );
  }
}

// Expose
module.exports = Mockiji;
