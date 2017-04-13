'use strict';

const express = require('express');
const cors = require('cors');
const MockCtrl = require('../controllers/MockCtrl');

module.exports = function({Configuration, Logger, app}) {
  // Cross-domain management
  app.use(cors());

  // Index route
  app.use(express.static('./public'));

  // Mocks route
  app.use(function(req, res) {
    new MockCtrl({Configuration, Logger}).buildResponse(req, res);
  });
};
