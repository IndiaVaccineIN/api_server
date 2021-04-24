const { reject } = require("lodash");
const mkdirp = require("mkdirp");

module.exports = async function makeDir(path) {
  return new Promise((resolve, reject) => {
    mkdirp(path, function (err) {
      if (err) reject(err);
      else resolve("done.");
    });
  });
};
