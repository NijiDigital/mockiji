module.exports = function(request) {

  const fs = require('fs');
  const path = require('path');

  function getDirectories () {
    return fs.readdirSync(__dirname)
        .filter(file => fs.lstatSync(path.join(__dirname, file)).isDirectory())
        .filter(file => file.indexOf('@') === -1);
  }

  return {
    content: {
      "members": getDirectories()
    }
  }
};
