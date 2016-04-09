'use strict';

let util = require('util');

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
  function _generatePaths(method, url, queryString) {

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

    return urls;
  }

  return {
    generatePaths: _generatePaths
  }

}

module.exports = FilePathBuilderService;
