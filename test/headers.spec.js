'use strict';

const path = require('path');

describe("Headers", function() {
  beforeEach(function(done) {
    this.startServer({ dataPath: 'test/data/headers' }).then(done, done.fail);
  });

  afterEach(function(done) {
    this.stopServer().then(done, done.fail);
  });

  describe("X-Mockiji-Url", function() {
    it('should return the requested path', function(done) {
      this.checkPaths('GET', {
        'api/': {headers: {'X-Mockiji-Url': '/api'}},
        'api/test': {headers: {'X-Mockiji-Url': '/api/test'}},
        'api/subdir1': {headers: {'X-Mockiji-Url': '/api/subdir1'}},
        'api/subdir1/test': {headers: {'X-Mockiji-Url': '/api/subdir1/test'}},
      }).then(done, done.fail);
    });
  });

  describe("X-Mockiji-File", function() {
    it('should return the mock file path if found', function(done) {
      this.checkPaths('GET', {
        'api/': {headers: {'X-Mockiji-File': path.resolve(__dirname, 'data/headers/api/get.json')}},
        'api/test': {headers: {'X-Mockiji-File': path.resolve(__dirname, 'data/headers/api/get_test.json')}},
        'api/subdir1': {headers: {'X-Mockiji-File': path.resolve(__dirname, 'data/headers/api/subdir1/get.json')}},
        'api/subdir1/test': {headers: {'X-Mockiji-File': path.resolve(__dirname, 'data/headers/api/subdir1/get_test.json')}},
      }).then(done, done.fail);
    });

    it('should not be present if a mock file was not found', function(done) {
      this.checkPaths('GET', {
        'api/missing_mock': {headers: {'X-Mockiji-File': undefined}}, // eslint-disable-line no-undefined
      }).then(done, done.fail);
    });
  });

  describe("X-Mockiji-Not-Found", function() {
    it('should bet set if a mock file was not found', function(done) {
      this.checkPaths('GET', {
        'api/missing_mock': {headers: {'X-Mockiji-Not-Found': 'true'}},
      }).then(done, done.fail);
    });

    it('should not be present if a mock file has been found', function(done) {
      this.checkPaths('GET', {
        'api/': {headers: {'X-Mockiji-Not-Found': undefined}}, // eslint-disable-line no-undefined
        'api/test': {headers: {'X-Mockiji-Not-Found': undefined}}, // eslint-disable-line no-undefined
      }).then(done, done.fail);
    });
  });

  describe("X-Mockiji-Notices", function() {
    it('should contain additional information if needed', function(done) {
      this.checkPaths('GET', {
        'api/notices/empty_file': {headers: {'X-Mockiji-Notices': 'The mock file is empty'}},
        'api/notices/invalid_json': {headers: {'X-Mockiji-Notices': 'The mock file contains invalid JSON'}},
      }).then(done, done.fail);
    });
  });
});
