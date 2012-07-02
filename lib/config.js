var fs = require('fs')

// returns database configuration
exports.getDbConfig = function () {
  var config = fs.readFileSync(__dirname + '/../config/database.json', 'utf8');
  return JSON.parse(config);
}

/**
 * Returns javascript assets config
 *
 */
exports.getAssetsJS = function () {
  var config = fs.readFileSync(__dirname + '/../config/js_assets.json', 'utf8');
  return JSON.parse(config);
}

/**
 * Returns css assets config
 *
 */
exports.getAssetsCSS = function () {
  var config = fs.readFileSync(__dirname + '/../config/css_assets.json', 'utf8');
  return JSON.parse(config);
}

/**
 * Returns templates config
 *
 */
exports.getTemplates = function () {
  var config = fs.readFileSync(__dirname + '/../config/templates.json', 'utf8');
  return JSON.parse(config);
}
