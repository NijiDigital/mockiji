'use strict';

const util = require('util');
const Toolbox = require('../utils/Toolbox.js');

/**
 * This Controller is for recomposing the URL from both the original URL and the authorization token
 */
class URLRecomposerService {
  /**
   * Constructor.
   */
  constructor({Configuration, Logger}) {
    this.Configuration = Configuration;
    this.Logger = Logger;
  }

  /**
   * Recompose the URL from the request url and authorization token
   * @param request the request
   * @returns {Array}
   * @private
   */
  recompose(request) {
    let rawUrl = Toolbox.removeTrailingSlash(request.url);

    // Read the authorization token if provided and rebuild the request url
    let authorizationHeader = request.headers.authorization;

    if(authorizationHeader) {

      // Authorization token is present
      this.Logger.debug(
        {"authorizationHeader": authorizationHeader},
        'Credentials sent!');
      var token = this._decodeAuthorizationToken(request);

      // If the authorization token is invalid
      if(token === null) {
        this.Logger.warn(
          {"authorizationHeader": authorizationHeader},
          "The authorization token was present but was not base64 encoded valid JSON");
        return rawUrl;
      }

      // If the token is an object
      const authorizationToken = this.Configuration.get('authorization_token');
      if(typeof(authorizationToken) === 'object') {
        let tokenConfigs = authorizationToken;

        // We browse the token configs array
        for(let i in tokenConfigs) {
          let tokenConfig = tokenConfigs[i];
          let rawRegexp = tokenthis.Configuration.regexp;
          var regexp = new RegExp(rawRegexp, 'i');

          // We test the config regexp
          if(regexp.test(rawUrl)) {

            // If matched, we invert the replacing group to replace the good ones
            var invertedRegExp = this._invertRegexpGroups(rawRegexp);
            let iRegExp = new RegExp(invertedRegExp,'i');

            // We fetch the replacement data to replace the group
            let replacementKey = tokenthis.Configuration.token_replacement_key;
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

  _invertRegexpGroups(regexp) {
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
  _decodeAuthorizationToken(request) {
    var encoded = request.headers.authorization.split(' ')[1];
    var decoded = new Buffer(encoded, 'base64').toString('utf8');
    try {
      return JSON.parse(decoded);
    } catch(e) {
      return null;
    }
  }
}

module.exports = URLRecomposerService;
