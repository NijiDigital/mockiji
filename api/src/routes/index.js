'use strict';
let util = require('util');
var MockCtrl = require('../controllers/MockCtrl');

module.exports = function(pApp) {

    pApp.all('/api*', function(req, res) {
        new MockCtrl().buildResponse(req, res);
	});

};
