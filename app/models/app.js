/**
 * App model
 */

if (global.GENTLY) {require = GENTLY.hijack(require)};

var crypto = require('crypto')
  , _ = require("underscore")
  , helper = require('helper')
  , Seq = require("seq")

function App() {

}
module.exports = App

App.method1 = function() {
  var app = this.app()

  return 'smth'
}

App.prototype.method2 = function() {
  var app = this.app()
  return 'foo'
}

