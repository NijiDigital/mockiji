/**
 * This script is called if a get.script file is found in the parent folder
 * @param request the request object
 * @param data the data from the profile-data.json file as described in the get.script
 */
module.exports = function(request, data) {
  return {
    content: {
      data,
      request
    }
  };
}
