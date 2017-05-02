'use strict';

module.exports = function(request) {
  return {
    content: {
      value: request.query.key,
    }
  };
}
