'use strict';

const url = require('url');

class Toolbox {
  /**
   * Remove trailing slash to the parametered string if presents
   * @param string the string to clean
   * @returns string the cleaned string
   */
  static removeTrailingSlash(str) {
    return str.replace(/\/$/, '');
  }

  /**
   * Resolve shortest path from a path
   * With '/root/mocks/../data' => '/root/data'
   * @param string root the first part of the path
   * @param string path the last part of the path
   * @returns string the resolved path
   */
  static resolveAbsolutePath(root, path) {
    return url.resolve(root+'/', path).replace(/(\/)\.\*$/, '.*');
  }

  /**
   * Prepend the basePath parameter for each path contained in the paths parameter.
   * Then convert these relative paths to the absolute paths
   * @param string basePath a path to prepend to the paths
   * @param paths array the paths to convert
   * @returns array the absolute converted paths
   */
  static buildAbsolutePaths(basePath, paths) {
    let absolutePaths = [];
    paths.forEach((element) => {
      let path = basePath + element;
      absolutePaths.push(Toolbox.resolveAbsolutePath(__dirname, path));
    });
    return absolutePaths;
  }
}

module.exports = Toolbox;
