var helper = require("../lib/helper")

module.exports = function init(obj) {
  if (obj && typeof obj !== "object") {
    throw new Error("wrong parameter passed")
  }
  // initialized vars
  var table = obj.table

  return {
    addModel: function addModel(app, name) {
      name = name || table;
      var AppModel = require(__dirname + "/../app/models/app_model");
      var Model = require(__dirname + "/../app/models/" + name);
      helper.inherits(Model, AppModel);
      Model.app = app;
      Model.prototype.app = app;

      return Model;
    }
  }
}

