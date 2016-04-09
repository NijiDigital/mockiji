'use strict';

var Toolbox = function() {

  /**
   * Remove trailing slash to the parametered string if presents
   * @param string the string to clean
   * @return string the cleaned string
   */
  function _removeTrailingSlash(str) {
    return str.replace(/\/$/, '');
  }

  return {
    removeTrailingSlash: _removeTrailingSlash
  }

}

module.exports = Toolbox;
