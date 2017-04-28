'use strict';

const express = require('express');

class Mockiji {
  /**
   * Constructor.
   *
   * @param {Object} options
   * @param {Object} options.configuration - A configuration object
   * @param {string} options.configFile - A path to a configuration file
   */
  constructor(options = {}) {
    // Create Configuration and Logger
    this.Configuration = require('./utils/Configuration')(options);
    this.Logger = require('./utils/Logger')({
      Configuration: this.Configuration
    });

    // Server
    this.app = express();

    // Server configuration
    this.app.use(express.json());
    this.app.use(express.urlencoded());
    this.http = require('http').Server(this.app);

    // Routes
    this.routes = require('./routes/index');
    this.routes({
      Configuration: this.Configuration,
      Logger: this.Logger,
      app: this.app
    });
  }

  /**
   * Start the server.
   *
   * @return {Promise}
   */
  start() {
    // Launch server
    const port = this.Configuration.get('port');
    return new Promise((resolve, reject) => {
      if (this.http && this.http.listening) {
        reject(new Error('Server is already listening'));
        return;
      }

      this.http.once('error', reject);
      this.http.listen(port, resolve);
    }).then(
      () => { this.Logger.info(`Server listening on port ${port}`); },
      (error) => {
        this.Logger.error(`Could not start server on port ${port}`);
        throw error;
      }
    );
  }

  /**
   * Stop the server.
   *
   * @return {Promise}
   */
  stop() {
    return new Promise((resolve, reject) => {
      if (!this.http || !this.http.listening) {
        reject(new Error('Server is not currently listening'));
        return;
      }

      this.http.once('error', reject);
      this.http.close(resolve);
    }).then(
      () => { this.Logger.info(`Server stopped listening`); },
      (error) => {
        this.Logger.error(`Could not stop server`);
        throw error;
      }
    )
  }
}

// Expose
module.exports = Mockiji;
