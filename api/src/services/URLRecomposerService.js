'use strict';

const util = require('util');
const Toolbox = require('../utils/Toolbox.js');

// Configuration and logger
const config = require('../utils/configuration');
const log = require('../utils/logger');

/**
 * This Controller is for recomposing the URL from both the original URL and the authorization token
 */
let URLRecomposerService = function() {

  /**
   * Recompose the URL from the request url and authorization token
   * @param request the request
   * @returns {Array}
   * @private
   */
  function recompose(request) {

      let toolbox = new Toolbox();
      let rawUrl = toolbox.removeTrailingSlash(request.url);

      // Read the authorization token if provided and rebuild the request url
      let authorizationHeader = request.headers.authorization;

      if(authorizationHeader) {

        // Authorization token is present
        log.debug(
          {"authorizationHeader": authorizationHeader},
          'Credentials sent!');
        var token = _decodeAuthorizationToken(request);

        // If the authorization token is invalid
        if(token === null) {
          log.warn(
            {"authorizationHeader": authorizationHeader},
            "The authorization token was present but was not base64 encoded valid JSON");
          return rawUrl;
        }

        // If the token is an object
        const authorizationToken = config.get('authorization_token');
        if(typeof(authorizationToken) === 'object') {
          let tokenConfigs = authorizationToken;

          // We browse the token configs array
          for(let i in tokenConfigs) {
            let tokenConfig = tokenConfigs[i];
            let rawRegexp = tokenConfig.regexp;
            var regexp = new RegExp(rawRegexp, 'i');

            // We test the config regexp
            if(regexp.test(rawUrl)) {

              // If matched, we invert the replacing group to replace the good ones
              var invertedRegExp = _invertRegexpGroups(rawRegexp);
              let iRegExp = new RegExp(invertedRegExp,'i');

              // We fetch the replacement data to replace the group
              let replacementKey = tokenConfig.token_replacement_key;
              let replacement = token[replacementKey];

              // We recompose the url with the replacement
              let url = rawUrl.replace(iRegExp, ['$1',replacement,'$2'].join(''));

              return url;

            }
          }
        }
      }

      return rawUrl;
    }

    function _invertRegexpGroups(regexp) {
      let startGroup = regexp.indexOf('(');
      let stopGroup = regexp.indexOf(')');
      let invertedRegExp = [
        '(',
        regexp.substring(0, startGroup),
        ')',
        regexp.substring(startGroup+1, stopGroup),
        '(',
        regexp.substring(stopGroup+1),
        ')'].join('');
      return invertedRegExp;
    }

    /**
     * Extract the authorization Token and base64 decode it
     * @returns the decoded token or null
     * @private
     */
    function _decodeAuthorizationToken(request) {
      var encoded = request.headers.authorization.split(' ')[1];
      var decoded = new Buffer(encoded, 'base64').toString('utf8');
      try {
        return JSON.parse(decoded);
      } catch(e) {
        return null;
      }
    }

    // Expose
    return {
      recompose: recompose
    }

}

module.exports = URLRecomposerService;
