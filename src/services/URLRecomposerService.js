'use strict';

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
      this.Logger.debug(`Found an Authorization header: "${authorizationHeader}"`);
      const token = this._decodeAuthorizationToken(request);

      // If the authorization token is invalid
      if(token === null) {
        this.Logger.warn(
          {'authorizationHeader': authorizationHeader},
          `An autorization header was found but it did not contain a valid base64 encoded JSON object`
        );
        return rawUrl;
      }

      // If the token is an object
      const authorizationToken = this.Configuration.get('authorization_header_replacements');
      if(typeof(authorizationToken) === 'object') {
        const tokenConfigs = authorizationToken;

        // We browse the token configs array
        for(let i in tokenConfigs) {
          const tokenConfig = tokenConfigs[i];
          const rawRegexp = tokenConfig.regexp;
          const regexp = new RegExp(rawRegexp, 'i');

          // We test the config regexp
          if(regexp.test(rawUrl)) {
            // If matched, we invert the replacing group to replace the good ones
            const invertedRegExp = this._invertRegexpGroups(rawRegexp);
            const iRegExp = new RegExp(invertedRegExp,'i');

            // We fetch the replacement data to replace the group
            const replacementKey = tokenConfig.token_replacement_key;
            const replacement = token[replacementKey];

            // We recompose the url with the replacement
            return rawUrl.replace(iRegExp, ['$1',replacement,'$2'].join(''));
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
    const encoded = request.headers.authorization.split(' ')[1];
    const decoded = new Buffer(encoded, 'base64').toString('utf8');
    try {
      return JSON.parse(decoded);
    } catch(e) {
      return null;
    }
  }
}

module.exports = URLRecomposerService;
