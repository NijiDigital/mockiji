'use strict';

const rp = require('request-promise-native');
const Mockiji = require('../src/index');

describe('API', function() {
  let server = null;

  beforeEach(function() {
    server = new Mockiji({
      configuration: {
        api_base_path: 'test/data/api',
        port: this.getServerPort(),
        logs: [],
        silent: true,
      }
    });
  });

  afterEach(function(done) {
    server.stop().then(done, done);
  });

  describe('start method', function() {
    it('should start the server if called', function(done) {
      rp(`http://127.0.0.1:${this.getServerPort()}/api/`).
      then(done.fail, () => server.start()).
      catch(done.fail).
      then(() => rp(`http://127.0.0.1:${this.getServerPort()}/api/`)).
      then(done, done.fail);
    });

    it('should reject the promise if the server is already running', function(done) {
      server.start().
      catch(done.fail).
      then(() => server.start()).
      then(done.fail, done);
    });
  });

  describe('stop method', function() {
    it('should stop the server if called', function(done) {
      server.start().
      then(() => server.stop()).
      catch(done.fail).
      then(() => rp(`http://127.0.0.1:${this.getServerPort()}/api/`)).
      then(done.fail, done);
    });

    it('should reject the promise if the server is not running', function(done) {
      server.stop().
      then(done.fail, done);
    });
  });
});
