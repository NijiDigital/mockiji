'use strict';

describe("Errors", function() {
  beforeEach(function(done) {
    this.startServer({ dataPath: 'test/data/errors' }).then(done, done.fail);
  });

  afterEach(function(done) {
    this.stopServer().then(done, done.fail);
  });

  it('should return an error in case of an invalid JSON file', function(done) {
    this.checkPaths('GET', {
      'api/invalid_json': {status: 500},
    }).then(done, done.fail);
  });

  it('should return an error if a mock could not be found', function(done) {
    this.checkPaths('GET', {
      'api/missing_file': {status: 404},
    }).then(done, done.fail);
  });
});
