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
      port: this.getServerPort(),
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
      uri: `http://127.0.0.1:${this.getServerPort()}/${path}`,
      resolveWithFullResponse: true,
      simple: false,
    });
  }

  /**
   * Return the port Mockiji should be started on during tests.
   * @return {number}
   */
  this.getServerPort = function() {
    return SERVER_PORT;
  }

  /**
   * Test if the given query paths are using the right mock files.
   * @param {string} method - HTTP Method
   * @param {Object} paths - An object whose keys are query paths and values are expectations
   * @return {Promise}
   */
  this.checkPaths = function(method, paths) {
    const promises = Object.keys(paths).map((path) => {
      const expectedStatus = paths[path].status;
      const expectedFile = paths[path].file;
      const expectedResponse = paths[path].response;
      const expectedHeaders = paths[path].headers;

      return this.doRequest(method, path).then((response) => {
        if (expectedStatus) {
          expect(response.statusCode).toBe(expectedStatus, `Path "${path}" should return status code ${expectedStatus} but returned ${response.statusCode}`);
        }

        if (expectedFile) {
          const mockFile = response.headers['x-mockiji-file'];
          expect(mockFile.endsWith(expectedFile)).toBe(true, `Path "${path}" should use file "${expectedFile}" but used file "${mockFile}"`);
        }

        if (expectedResponse) {
          try {
            const serverResponse = (typeof expectedResponse === 'object') ? JSON.parse(response.body) : response.body;
            expect(serverResponse).toEqual(expectedResponse);
          } catch (e) {
            fail(`Server was expected to return a JSON response but returned "${response.body}"`);
          }
        }

        if (expectedHeaders) {
          for (let header in expectedHeaders) {
            expect(response.headers[header.toLowerCase()]).toEqual(expectedHeaders[header]);
          }
        }
      });
    });

    return Promise.all(promises);
  }
});
