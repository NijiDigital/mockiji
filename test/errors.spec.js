'use strict';

describe("Errors", function() {
  beforeEach(function(done) {
    return this.startServer({ dataPath: 'test/data/errors' }).then(done, done.fail);
  });

  afterEach(function(done) {
    this.stopServer().then(done, done.fail);
  });
});
