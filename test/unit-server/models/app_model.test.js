var helper = require("test_helper")
  , gently = new (require('gently'))
  , should = require('should')

var _ = require("underscore")._
  , AppModel = helper.require('/app/models/app_model')

describe('app_model', function () {
  it('should Model.build with default settings', function () {
    var instance = AppModel.build({session_id: 15}, {})
    instance.isNewRecord.should.equal(true);
    instance.session_id.should.equal(15);
    instance.attributes[0].should.equal("session_id")
    instance.attributes.length.should.equal(1)
  })
  it('should Model.build with isNewRecord false', function () {
    var instance = AppModel.build({session_id: 15}, {isNewRecord: false})
    instance.isNewRecord.should.equal(false);
  })
  //'test Model.build - no empty attribute allowed': function () {
    //should.throws(function () {
      //AppModel.build({})
    //});
  //},
  it('should Model.find when only function passed', function () {
    should.throws(
      function () {
        AppModel.find(function () {})
      }
    )
  })
  it('should Model.find when empty options passed', function () {
    should.throws(
      function () {
        AppModel.find(null, function () {})
      }
    )
  })
  it('should Model.find options correct when number passed', function () {
    var gently = new (require('gently'))
    var AppModel = helper.require('/app/models/app_model');
    AppModel.tableName = "app_model"
    AppModel.db = {}
    gently.expect(AppModel.db, 'query', function (query, cb) {
      query.should.equal("SELECT * FROM `app_model` WHERE `id`=10 LIMIT 1;")
      cb(null, null)
    });

    AppModel.find(10, function () {})
  })
  it('should Model.find options correct when object passed', function () {
    var gently = new (require('gently'))
    var AppModel = helper.require('/app/models/app_model');
    AppModel.tableName = "app_model"
    AppModel.db = {}
    gently.expect(AppModel.db, 'query', function (query, cb) {
      query.should.equal("SELECT * FROM `app_model` WHERE `user_id`=15 LIMIT 1;")
      cb(null, null)
    });

    AppModel.find({where: {user_id: 15}}, function () {})
  })
  it('should Model.find check that instance object is built', function () {
    var gently = new (require('gently'))
    var AppModel = helper.require('/app/models/app_model');
    AppModel.tableName = "app_model"
    AppModel.db = {}
    var results = [{id: 15, user_id: 16}]
    gently.expect(AppModel.db, 'query', function (query, cb) {
      cb(null, results);
    });

    AppModel.find(10, function (err, instance) {
      instance.id.should.equal(15)
      instance.user_id.should.equal(16)
      instance.isNewRecord.should.be.false
    })
  })
  it('should Model.findAll options correct when object passed', function () {
    var gently = new (require('gently'))
    var AppModel = helper.require('/app/models/app_model');
    AppModel.tableName = "app_model"
    AppModel.db = {}
    gently.expect(AppModel.db, 'query', function (query, cb) {
      query.should.equal("SELECT * FROM `app_model` WHERE `user_id`=15;")
      cb(null, null)
    });

    AppModel.findAll({where: {user_id: 15}}, function () {})
  })
  it('should Model.findAll check that instance object is built', function () {
    var gently = new (require('gently'))
    var AppModel = helper.require('/app/models/app_model');
    AppModel.tableName = "app_model"
    AppModel.db = {}
    var results = [{id: 15}]
    gently.expect(AppModel.db, 'query', function (query, cb) {
      cb(null, results);
    });

    AppModel.findAll(null, function (err, instances) {
      instances.length.should.equal(1)
      var instance = instances[0]
      instance.id.should.equal(15)
    })
  })
  it('should Model.findQuery check that instance object is built', function () {
    var gently = new (require('gently'))
    var AppModel = helper.require('/app/models/app_model');
    AppModel.db = {}
    gently.expect(AppModel.db, 'query', function (query, cb) {
      query.should.equal("SELECT e.id FROM events")
      cb(null, ["obj"])
    })
    gently.expect(AppModel, 'build', function () {
      return "wrapobj"
    })

    AppModel.findQuery("SELECT e.id FROM events", function (err, results) {
      results[0].should.equal("wrapobj")
    })
  })
  it('should Model#save new object', function () {
    var gently = new (require('gently'))
    var AppModel = helper.require('/app/models/app_model');
    var model = AppModel.build({name: "Evgeny"});
    model.tableName = "app_model"
    model.db = {}
    gently.expect(model.db, 'query', function (query, cb) {
      query.should.equal("INSERT INTO `app_model` (`name`) VALUES ('Evgeny');")
      cb(null, {insertId: 1})
    });

    model.save(function (err, instance) {
      instance.id.should.be.equal(1)
      instance.isNewRecord.should.be.false
    })
  })
  it('should Model#save existing object', function () {
    var gently = new (require('gently'))
    var AppModel = helper.require('/app/models/app_model');
    var model = AppModel.build({name: "Evgeny"}, {isNewRecord: false});
    model.tableName = "app_model"
    model.db = {};
    model.id = 1;
    gently.expect(model.db, 'query', function (query, cb) {
      query.should.equal("UPDATE `app_model` SET `name`=\'Evgeny\' WHERE `id`=1")
      cb(null, {})
    });

    model.save(function (err, instance) {
      instance.name.should.be.equal("Evgeny")
    })
  })
  it('should Model#updateAttributes', function () {
    var AppModel = helper.require('/app/models/app_model');
    AppModel.prototype.save = function (cb) {} // mock the function
    var model = AppModel.build({attr: "attrValue"});

    model.updateAttributes({
      id: "id",
      created_at: "created_at",
      updated_at: "updated_at",
      name: "Evgeny"
    }, function () {
    })

    model.name.should.be.equal("Evgeny");
    should.not.exist(model.created_at);
    model.attributes.length.should.equal(2);
    model.attributes[1].should.equal("attr");
    model.attributes[0].should.equal("name");
  })
  it('should Model#addAttribute', function () {
    var AppModel = helper.require('/app/models/app_model');
    var model = AppModel.build({attr: "attrValue"});
    model.addAttribute('name', "Evgeny")

    model.name.should.be.equal("Evgeny");
    model.attributes.length.should.equal(2);
    model.attributes[0].should.equal("attr");
    model.attributes[1].should.equal("name");
  })
  it('should Model#values', function () {
    var AppModel = helper.require('/app/models/app_model');
    var model = AppModel.build({name: "Name", email: "Email"});
    model.test = "Test";
    var result = model.values()

    result.name.should.be.equal("Name");
    result.email.should.be.equal("Email");
    _.keys(result).length.should.be.equal(2);
  })
  it('should Model.create', function () {
    var gently = new (require('gently'))
    var AppModel = helper.require('/app/models/app_model');
    var mock = {}
    gently.expect(AppModel, 'build', function (params, cb) {
      params.name.should.be.equal("Name")
      return mock;
    });
    gently.expect(mock, 'save', function (query, cb) {});
    AppModel.create({name: "Name"}, function () {});
  })
  it('should Model.destroy options correct when number passed', function () {
    var gently = new (require('gently'))
    var AppModel = helper.require('/app/models/app_model');
    AppModel.tableName = "app_model"
    AppModel.db = {}
    gently.expect(AppModel.db, 'query', function (query, cb) {
      query.should.equal("DELETE FROM `app_model` WHERE `id`=10 LIMIT 1;")
      cb(null, null)
    });

    AppModel.destroy(10, function () {})
  })
  it('should Model.destroy options correct when object passed', function () {
    var gently = new (require('gently'))
    var AppModel = helper.require('/app/models/app_model');
    AppModel.tableName = "app_model"
    AppModel.db = {}
    gently.expect(AppModel.db, 'query', function (query, cb) {
      query.should.equal("DELETE FROM `app_model` WHERE `user_id`=15 LIMIT 1;")
      cb(null, null)
    });

    AppModel.destroy({where: {user_id: 15}}, function () {})
  })
  it('should Model.destroyAll options correct when object passed', function () {
    var gently = new (require('gently'))
    var AppModel = helper.require('/app/models/app_model');
    AppModel.tableName = "app_model"
    AppModel.db = {}
    gently.expect(AppModel.db, 'query', function (query, cb) {
      query.should.equal("DELETE FROM `app_model` WHERE `user_id`=15;")
      cb(null, null)
    });

    AppModel.destroyAll({where: {user_id: 15}}, function () {})
  })
  it('should destroyAll without options', function () {
    var gently = new (require('gently'))
    var AppModel = helper.require('/app/models/app_model');
    AppModel.tableName = "app_model"
    AppModel.db = {}
    gently.expect(AppModel.db, 'query', function (query, cb) {
      query.should.equal("DELETE FROM `app_model`;")
      cb(null, null)
    });

    AppModel.destroyAll({}, function () {})
  })
  it('should Model#pictureUrl', function () {
    var AppModel = helper.require('/app/models/app_model');
    var instance = AppModel.build({name: "Name", id: 10});

    gently.expect(helper.mock("helper"), "pictureUrl", function (item, size) {
      item.id.should.equal(10)
      size.should.equal("medium")
    })
    instance.pictureUrl("medium")
  })
  it('should Model#webUrl', function () {
    var AppModel = helper.require('/app/models/app_model');
    var instance = AppModel.build({name: "Name", id: 10});
    instance.api = "people"

    gently.expect(helper.mock("helper"), "webUrl", function (api, id) {
      api.should.equal("people")
      id.should.equal(10)
    })
    instance.webUrl("medium")
  })
})

