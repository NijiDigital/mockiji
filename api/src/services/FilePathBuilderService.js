'use strict';

let Toolbox = require('../utils/Toolbox.js');
let util = require('util');
let fs = require('fs');

// Configuration
let env = require('../../config/env.json');
let config = require('../../config/'+ env.name +'.json');

// Logger
let bunyan = require('bunyan');
let log = bunyan.createLogger({name: config.logger.name});

/**
 * This Controller is for building the response
 */
let FilePathBuilderService = function() {

  /**
   *
   * @param method
   * @param url
   * @param queryString
   * @returns {Array}
   * @private
   */
  function generatePaths(method, url, queryString) {

    let urls = [];

    // Remove the parameters for building paths (at the moment)
    let request = url.split('?');
    let path = request[0];

    // @TODO Use parameters to build more paths
    let parameters = [];
    if(typeof request[1] === 'string') {
      parameters = request[1].split('&');
    }

    // Let's split the path to work with it
    let allParts = path.split('/');

    // method.json
    {
      let url1 = allParts.join('/') + '/' + method + '\\.*';
      urls.push(url1);
    }

    // ../method_lastElement.json
    // ../../method_beforeLastElement_lastElement.json
    // etc.
    let partsCount = allParts.length;
    for(let p=1; p <= (partsCount-1); ++p) {
      let pathParts = [];
      let fileBodyName = [method];
      let fileExtensionName = '\\.*';
      for(let i=0; i<allParts.length; ++i) {
          if(i < allParts.length - (p)) {
              pathParts.push(allParts[i]);
          } else {
              fileBodyName.push(allParts[i]);
          }
      }
      let url = pathParts.join('/') + '/' + fileBodyName.join('_') + fileExtensionName;
      urls.push(url);
    }

    // ../@default/method.json
    // ../../@default/method_lastElement.json
    // ../../../@default/method_beforeLastElement_lastElement.json
    // etc.
    for(let p=1; p <= (partsCount-1); ++p) {
      let pathParts = [];
      let fileBodyName = [method];
      let fileExtensionName = '\\.*';
      for(let i=0; i<allParts.length; ++i) {
          if(i < allParts.length - (p)) {
              pathParts.push(allParts[i]);
          }
          else if(i == allParts.length - (p)) {
              pathParts.push('@default');
          }
          else {
              fileBodyName.push(allParts[i]);
          }
      }
      let url = pathParts.join('/') + '/' + fileBodyName.join('_') + fileExtensionName;
      urls.push(url);
    }

    let toolbox = new Toolbox();
    let absoluteURLs = urls.map((element) => {
      let path = config.listen_to_these_api_base_urls.api + element;
      return toolbox.resolveAbsolutePath(__dirname, path);
    });

    return absoluteURLs;
  }

  return {
    generatePaths: generatePaths
  }

}

module.exports = FilePathBuilderService;
