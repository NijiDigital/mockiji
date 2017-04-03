'use strict';

const url = require('url');

const Toolbox = function() {

  /**
   * Remove trailing slash to the parametered string if presents
   * @param string the string to clean
   * @returns string the cleaned string
   */
  function removeTrailingSlash(str) {
    return str.replace(/\/$/, '');
  }

  /**
   * Resolve shortest path from a path
   * With '/root/mocks/../data' => '/root/data'
   * @param string root the first part of the path
   * @param string path the last part of the path
   * @returns string the resolved path
   */
  function resolveAbsolutePath(root, path) {
    return url.resolve(root+'/', path).replace(/(\/)\.\*$/, '.*');
  }


  /**
   * Prepend the basePath parameter for each path contained in the paths parameter.
   * Then convert these relative paths to the absolute paths
   * @param string basePath a path to prepend to the paths
   * @param paths array the paths to convert
   * @returns array the absolute converted paths
   */
  function buildAbsolutePaths(basePath, paths) {
    let absolutePaths = [];
    paths.forEach(function(element) {
      let path = basePath + element;
      absolutePaths.push(resolveAbsolutePath(__dirname, path));
    });
    return absolutePaths;
  }

  return {
    buildAbsolutePaths,
    removeTrailingSlash,
    resolveAbsolutePath,
  }

}

module.exports = Toolbox;
