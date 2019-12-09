const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: __dirname + "/.env" });

/**
 * Given an image file name in our `img/` folder, give back that file
 * as a base64 encoded string
 * @param {String}
 * @returns {String}
 */
function imgToBase64(imageFile) {
  return fs.readFileSync(path.join(__dirname, "img", imageFile), "base64");
}

function getNetlifyOAuth() {
  return process.env.NETLIFY_AUTH_TOKEN;
}

module.exports = {
  imgToBase64,
  getNetlifyOAuth
};
