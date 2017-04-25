'use strict';
let util = require('util');
var MockCtrl = require('../controllers/MockCtrl');
var cors = require('cors');
var log = require('../utils/logger');

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
