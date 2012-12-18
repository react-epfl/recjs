/**
 * App model
 */

if (global.GENTLY) {require = GENTLY.hijack(require)};

var crypto = require('crypto')
  , _ = require("underscore")
  , helper = require('helper')
  , Seq = require("seq")

//function App() {

//}
module.exports =
{ title: String
, source: String
, thumbnail: String
, screenshot: String
, description: String
}

//App.method1 = function() {
  //var app = this.app()

  //return 'smth'
//}

//App.prototype.method2 = function() {
  //var app = this.app()
  //return 'foo'
//}

