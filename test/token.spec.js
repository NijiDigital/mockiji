'use strict';

const Mockiji = require('../src/index');

describe('Token', function() {
  let server = null;

  beforeEach(function() {
    server = new Mockiji({
      configuration: {
        api_base_path: 'test/data/token',
        port: this.getServerPort(),
        authorization_token: 'base64',
        dynamic_markers: [
          {
            "regexp": "/api/(-)",
            "type": "token",
            "replacement_key": "marker_id"
          }
        ],
        logs: [],
        silent: true,
      }
    });
    server.start({ dataPath: 'test/data/token' })
  });

  afterEach(function(done) {
    server.stop().then(done, done.fail);
  });

  it('should handle dynamic markers', function(done) {
    this.checkPaths('GET', {
      'api/-/': {file: '/api/mockiji/get.json'}
    },
      {'Authorization': 'Beared eyJtYXJrZXJfaWQiOiJtb2NraWppIn0='}).then(done, done.fail);
  });

  it('should take @default', function(done) {
    this.checkPaths('GET', {
      'api/test/': {file: '/api/@default/get.json'},
    }).then(done, done.fail);
  });
});

