'use strict';
const util = require('util');
const MockCtrl = require('../controllers/MockCtrl');
const cors = require('cors');

module.exports = function({Configuration, Logger, app}) {
  // Cross-domain management
  app.use(cors());

  // HeartBeat test
  app.get('/', function(req, res) {
    res.end('Mockiji server is alive!');
	});

  // Main route
  app.all('/api*', function(req, res) {
    new MockCtrl({Configuration, Logger}).buildResponse(req, res);
	});

};
