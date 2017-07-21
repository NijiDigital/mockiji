/**
 * Get movie history for a given member
 */
module.exports = function(request, data) {
  return {
    content: {
      data,
      request
    }
  };
}
