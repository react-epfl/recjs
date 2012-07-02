/**
 * Home controller
 */

var inherits = require('util').inherits
  , nodemailer = require('nodemailer')
  , Seq = require("seq")
  , helper = require("../../lib/helper")
  , _ = require("underscore")._

function RecomsController() {}
module.exports = RecomsController;

RecomsController.prototype.init = function (app) {
  app.get('/'
         , this.index.bind(this)
         )
   app.get( '/gadget/:id'
          , this.gadget.bind(this)
          )

};

RecomsController.prototype.index = function (req, res) {
  var app = req.app

  // build output object and then give it to view
  var output = {};

  Seq()
    .seq(function getRecoms() {
      var self = this;

      app.Gadget.find(1, function (err, result) {
        if (err) self(err)

        self(null, result)
      })
    })
    .seq(function sendResponse(data) {
      // console.log(output);
      res.json(data)
    })

};

RecomsController.prototype.gadget = function (req, res) {
  var app = req.app
    , gadgetId = req.params.id * 1

  // build output object and then give it to view
  var output = {};
  Seq()
    .seq(function getRecoms() {
      var self = this;

      app.Gadget.find(gadgetId, function (err, result) {
        if (err) self(err)

        self(null, result)
      })
    })
    .seq(function sendResponse(data) {
      // console.log(output);
      res.json(data)
    })
    .catch(function (err) {
      res.json(err)
    })

};
