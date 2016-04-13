'use strict';
var url = require('url');

var Toolbox = function() {

  /**
   * Remove trailing slash to the parametered string if presents
   * @param string the string to clean
   * @return string the cleaned string
   */
  function removeTrailingSlash(str) {
    return str.replace(/\/$/, '');
  }

  /**
   * Resolve shortest path from a path
   * With '/root/mocks/../data' => '/root/data'
   * @param string root the first part of the path
   * @param string path the last part of the path
   * @return string the resolved path
   */
  function resolveAbsolutePath(root, path) {
    return url.resolve(root+'/', path).replace(/(\/)\.\*$/, '.*');
  }

  return {
    removeTrailingSlash: removeTrailingSlash,
    resolveAbsolutePath: resolveAbsolutePath
  }

}

module.exports = Toolbox;
