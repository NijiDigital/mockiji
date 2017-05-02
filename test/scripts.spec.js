'use strict';

describe("Scripts", function() {
  beforeEach(function(done) {
    this.startServer({ dataPath: 'test/data/scripts' }).then(done, done.fail);
  });

  afterEach(function(done) {
    this.stopServer().then(done, done.fail);
  });

  it('should be able to execute basic scripts', function(done) {
    this.checkPaths('GET', {
      'api/basic': {status: 200, response: {message: 'OK'}},
    }).then(done, done.fail);
  });

  it('should be able to use the request', function(done) {
    this.checkPaths('GET', {
      'api/request?key=abcd': {status: 200, response: {value: 'abcd'}},
      'api/request?key=1234': {status: 200, response: {value: '1234'}},
    }).then(done, done.fail);
  });

  it('should be able to modify the HTTP status', function(done) {
    this.checkPaths('GET', {
      'api/status?code=200': {status: 200},
      'api/status?code=400': {status: 400},
      'api/status?code=404': {status: 404},
      'api/status?code=500': {status: 500},
    }).then(done, done.fail);
  });
});
