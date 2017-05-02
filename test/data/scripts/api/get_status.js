'use strict';

module.exports = function(request) {
  return {
    httpCode: request.query.code,
    content: {}
  };
}
