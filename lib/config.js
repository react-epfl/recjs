var fs = require('fs')
	, helper = require('helper')

// returns database configuration
exports.getDbConfig = function () {
  var config = fs.readFileSync(helper.fullPath('/config/database.json'), 'utf8');
  return JSON.parse(config);
}

/**
 * Returns javascript assets config
 *
 */
exports.getAssetsJS = function () {
  var config = fs.readFileSync(helper.fullPath('/config/js_assets.json'), 'utf8');
  return JSON.parse(config);
}

/**
 * Returns css assets config
 *
 */
exports.getAssetsCSS = function () {
  var config = fs.readFileSync(helper.fullPath('/config/css_assets.json'), 'utf8');
  return JSON.parse(config);
}

/**
 * Returns templates config
 *
 */
exports.getTemplates = function () {
  var config = fs.readFileSync(helper.fullPath('/config/templates.json'), 'utf8');
  return JSON.parse(config);
}
