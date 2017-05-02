'use strict';

const rp = require('request-promise-native');
const Mockiji = require('../../src/index');

const SERVER_PORT = 8081;

beforeEach(function() {
  this.serverInstance = null;

  /**
   * Start a new instance of Mockiji.
   * @param {string} dataPath - Path to the mock files
   * @return {Promise} A promise resolving on server startup
   */
  this.startServer = function({ dataPath }) {
    // Server configuration
    const configuration = {
      api_base_path: dataPath,
      port: SERVER_PORT,
      logs: [],
      silent: true,
    };

    // Check if the server is already running and stop it if that's the case
    if (this.serverInstance) {
      return this.stopServer().then(
        () => this.startServer({ dataPath })
      );
    }

    // Create a new Mockiji instance and start it
    this.serverInstance = new Mockiji({ configuration: configuration });
    return this.serverInstance.start();
  };

  /**
   * Stop the current Mockiji instance.
   * @return {Promise} A promise resolving on server shutdown
   */
  this.stopServer = function() {
    // If the server is already stopped
    if (!this.serverInstance) {
      return Promise.resolve();
    }

    // Stop the server
    return this.serverInstance.stop().then(() => {
      this.serverInstance = null;
    });
  };

  /**
   * Create and execute a new HTTP request.
   * @param {string} method - HTTP Method
   * @param {string} path - Path to use in the query
   * @return {Promise}
   */
  this.doRequest = function(method, path) {
    return rp({
      method: method,
      uri: `http://127.0.0.1:${SERVER_PORT}/${path}`,
      resolveWithFullResponse: true,
    });
  }

  /**
   * Test if the given query paths are using the right mock files.
   * @param {string} method - HTTP Method
   * @param {Object} paths - An object whose keys are query paths and values are expectations
   * @return {Promise}
   */
  this.checkPaths = function(method, paths) {
    const promises = Object.keys(paths).map((path) => {
      const expectedFile = paths[path];
      return this.doRequest(method, path).then((response) => {
        const mockFile = response.headers['x-mockiji-file'];
        expect(mockFile.endsWith(expectedFile)).toBe(true, `Path "${path}" should use file "${expectedFile}" but used file "${mockFile}"`);
      });
    });

    return Promise.all(promises);
  }
});
