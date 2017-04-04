'use strict';
const util = require('util');
const MockCtrl = require('../controllers/MockCtrl');
const cors = require('cors');

module.exports = function(pApp, pLog) {

  // Cross-domain management
  pApp.use(cors());

  // HeartBeat test
  pApp.get('/', function(req, res) {
    res.end('Mockiji server is alive!');
	});

  // Main route
  pApp.all('/api*', function(req, res) {
    new MockCtrl(pLog).buildResponse(req, res);
	});

};
