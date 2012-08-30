// boot all needed classes
var helper = require('helper');

/**
 * Loads all controllers
 */
var AppController = helper.require("/app/controllers/app_controller");

function loadControllers(app) {
  var fs = require("fs");

  fs.readdir(helper.fullPath('/app/controllers'), function (err, files) {
      if (err) {throw err;}
      files.forEach(function (file) {
        bootController(app, file);
      });
  });
}

function bootController(app, file) {
  // init controller and skip app_controller.js
  if (!file.match(/app_controller/) && file.match(/_controller.js/)) {
    var Controller = helper.require("/app/controllers/"+file);
    helper.inherits(Controller, AppController);

    var controller = new Controller();
    controller.init(app);
  };
}

/**
 * Loads all models
 */
var AppModel = helper.require("/app/models/app_model");

function loadModels(app) {
  var fs = require("fs");

  fs.readdir(helper.fullPath('/app/models'), function (err, files) {
      if (err) {throw err;}
      files.forEach(function (file) {
        bootModel(app, file);
      });

      // app.Calendar.initAssociations(app);
      // app.User.initAssociations(app);
  });

}

/**
 * Defines all models as global objects
 */
function bootModel(app, file) {
  // init model and skip app.js
  if (!file.match(/app_model/) && file.match(/js/)) {
    // export model constructor
    var Model = helper.require("/app/models/"+file);
    helper.inherits(Model, AppModel);

    // Define a globally available class for this model
    // and initialize it
    var fileName = file.replace(".js","")
    var modelName = helper.camelize(fileName,true);

    // set vars for quick access
    Model.app = app;
    Model.prototype.app = app;
    Model.db = app.db;
    Model.prototype.db = app.db;
    Model.tableName = helper.pluralize(fileName);
    Model.prototype.tableName = helper.pluralize(fileName);
    Model.classOf = fileName
    Model.prototype.classOf = fileName

    app[modelName] = Model;
  };
}

// start the loading process
exports.start = function (app) {
  loadControllers(app);
  loadModels(app);
};
