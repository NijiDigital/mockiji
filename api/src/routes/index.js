'use strict';
let util = require('util');
var MockCtrl = require('../controllers/MockCtrl');

module.exports = function(pApp) {

    // HeartBeat test
    pApp.get('/', function(req, res) {
        res.end('Mockiji server is alive!');
	});

    // Main route
    pApp.all('/api*', function(req, res) {
        new MockCtrl().buildResponse(req, res);
	});

};
