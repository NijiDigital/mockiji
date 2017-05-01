'use strict';

describe("Resolving", function() {
  beforeEach(function(done) {
    return this.startServer({ dataPath: 'test/data/resolving' }).then(done, done.fail);
  });

  afterEach(function(done) {
    return this.stopServer().then(done, done.fail);
  });

  it('should handle subdirectories', function(done) {
    this.checkPaths('GET', {
      'api/': '/api/get.json',
      'api/subdir1': '/api/subdir1/get.json',
      'api/subdir1/test1': '/api/subdir1/get_test1.json',
      'api/subdir1/test1/test2': '/api/subdir1/get_test1_test2.json',
      'api/subdir1/subdir1_1': '/api/subdir1/subdir1_1/get.json',
      'api/subdir1/subdir1_1/test1': '/api/subdir1/subdir1_1/get_test1.json',
      'api/subdir1/subdir1_1/test1/test2': '/api/subdir1/subdir1_1/get_test1_test2.json',
      'api/subdir2/subdir2_1/': '/api/subdir2/subdir2_1/get.json',
      'api/subdir2/subdir2_1/test1': '/api/subdir2/subdir2_1/get_test1.json',
    }).then(done, done.fail);
  });

  it('should use the @default paths', function(done) {
    this.checkPaths('GET', {
      'api/fallback': '/api/@default/get.json',
      'api/fallback/test1': '/api/@default/get_test1.json',
      'api/fallback/test1/test2': '/api/@default/get_test1_test2.json',
      'api/fallback/subdir1': '/api/@default/subdir1/get.json',
      'api/fallback/subdir1/test1': '/api/@default/subdir1/get_test1.json',
      'api/subdir1/fallback': '/api/subdir1/@default/get.json',
      'api/subdir2/fallback': '/api/subdir2/@default/get.json',
    }).then(done, done.fail);
  });

  it('should check the HTTP method', function(done) {
    Promise.all([
      this.checkPaths('POST', {
        'api/': '/api/post.json',
        'api/subdir1/': '/api/subdir1/post.json',
        'api/subdir1/test1': '/api/subdir1/post_test1.json',
        'api/subdir1/test1/test2': '/api/subdir1/post_test1_test2.json',
      }),
      this.checkPaths('PUT', {
        'api/': '/api/put.json',
        'api/subdir1/': '/api/subdir1/put.json',
        'api/subdir1/test1': '/api/subdir1/put_test1.json',
        'api/subdir1/test1/test2': '/api/subdir1/put_test1_test2.json',
      }),
      this.checkPaths('DELETE', {
        'api/': '/api/delete.json',
        'api/subdir1/': '/api/subdir1/delete.json',
        'api/subdir1/test1': '/api/subdir1/delete_test1.json',
        'api/subdir1/test1/test2': '/api/subdir1/delete_test1_test2.json',
      }),
    ]).then(done, done.fail);
  });
});
