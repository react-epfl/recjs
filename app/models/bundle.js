/**
 * Bundle model
 */

if (global.GENTLY) {require = GENTLY.hijack(require)};

var crypto = require('crypto')
  , _ = require("underscore")
  , helper = require('helper')
  , Seq = require("seq")

function Bundle() {

}
module.exports = Bundle

Bundle.method1 = function() {
  var app = this.app()

  return 'smth'
}

Bundle.prototype.method2 = function() {
  var app = this.app()
  return 'foo'
}

