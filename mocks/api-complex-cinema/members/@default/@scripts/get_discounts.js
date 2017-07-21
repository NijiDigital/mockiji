/**
 * Get a discount if a given member is a student and has seen at least 2 movies
 */
module.exports = function(request, data) {
  return {
    content: {
      data,
      request
    }
  };
}
