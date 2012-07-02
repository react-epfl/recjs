/**
 * AppAppModel
 */
if (global.GENTLY) {require = GENTLY.hijack(require)};

var QueryGenerator = require('../../lib/query_generator')
  , helper = require('../../lib/helper')
  , _ = require('underscore')._

function AppModel() {}
module.exports = AppModel;

/**
 * Builds a new object from options, later this object should be persisted with save
 *
 * @param attrs {Object} hash of attributes for db columns
 * @returns {Object} created JS object to be persisted
 */
AppModel.build = function (attrs, options) {
  options = options || {};
  attrs = attrs || {};
  // TODO: check if it can be safely removed
  //if (_.keys(attrs).length === 0) {
    //throw "You should have at least one attribute";
  //}

  var Ctor = this.prototype.constructor
  var instance = new Ctor();
  _.extend(instance, attrs);
  instance.attributes = _.keys(attrs);

  instance.isNewRecord = options.hasOwnProperty('isNewRecord') ? options.isNewRecord : true;
  return instance;
}

/**
 * Retrieve one object from database
 *
 * @param options {Object or Number}
 Options:
   - attributes -> An array of attributes (e.g. ['name', 'birthday']). Default: *
   - where -> A hash with conditions (e.g. {name: 'foo'})
              OR an ID as integer
              OR a string with conditions (e.g. 'name="foo"').
              If you use a string, you have to escape it on your own.
   - order -> e.g. 'id DESC'
   - group
   - limit -> The maximum count you want to get.
   - offset -> An offset value to start from. Only useable with limit!
 *
 * @param cb {Function} Callback
 * @returns {Array} Describe what it returns
 */
 AppModel.find = function (options, cb) {
  var self = this
  // options is not a hash but an id
  if(typeof options === 'number')
    options = {where: options}
  else if ((typeof options === 'function') || (options == null) || (options == undefined)) {
    throw "No options are given";
  }

  options.limit = 1

  function callback(err, results) {
    if (results && results.length !== 0) {
      // create new model instance from this data
      var instance = self.build(results[0], {isNewRecord: false})
      cb(err, instance);
    } else {
      cb(err, null);
    }
  }

  var query = QueryGenerator.selectQuery(this.tableName, options)
  return this.db.query(query, callback)
}

/**
 * Retrieve all objects from database
 *
 * @see AppModel.find
 */
AppModel.findAll = function (options, cb) {
  var self = this
  function callback(err, results) {
    // create new array of model instances
    var arr = []
      ;
    _.each(results, function (r) {
      var instance = self.build(r, {isNewRecord: false})
      arr.push(instance)
    })
    cb(err, arr);
  }
  return this.db.query(QueryGenerator.selectQuery(this.tableName, options), callback)
}

/**
 * Retrieve all objects from database with query
 * and wrap returned array as AppModel objects
 *
 * @see AppModel.find
 */
AppModel.findQuery = function (query, cb) {
  var self = this
  function callback(err, results) {
    // create new array of model instances
    var arr = []
      ;
    _.each(results, function (r) {
      var instance = self.build(r, {isNewRecord: false})
      arr.push(instance)
    })
    cb(err, arr);
  }
  return this.db.query(query, callback)
}

/**
 * Persists the object to db, callback gets a new db object
 */
AppModel.prototype.save = function (cb) {
  var self = this;
  if(this.isNewRecord) {
    var cb1 = function (err, result) {
      self.id = result.insertId
      self.isNewRecord = false
      cb(err, self)
    }
    return this.db.query(QueryGenerator.insertQuery(this.tableName, this.values()), cb1)
  } else {
    var id = this.id
    var cb2 = function (err, result) {
      cb(err, self) // return itself object
    }
    return this.db.query(QueryGenerator.updateQuery(this.tableName, this.values(), id), cb2)
  }
}

/**
 * Updates existing object in db, callback gets a new db object
 */
AppModel.prototype.updateAttributes = function (updates, cb) {
  // delete read-only attributes
  if (updates.id) { delete updates.id}
  if (updates.created_at) { delete updates.created_at}
  if (updates.updated_at) { delete updates.updated_at}

  _.extend(this, updates);
  this.attributes = _.union(_.keys(updates), this.attributes);
  return this.save(cb)
}

AppModel.prototype.addAttribute = function (attribute, value) {
  this[attribute] = value
  this.attributes.push(attribute)
}

/**
 * Builds a new object from options and persists it
 * callback gets a new db object
 */
AppModel.create = function (values, cb) {
  return this.build(values).save(cb)
}

AppModel.prototype.values = function () {
  var result = {}
    , self   = this

  // get all attributes that belong to the instance (not prototype)
  this.attributes.forEach(function (attr) {
    result[attr] = self[attr]
  })

  return result
}

/**
 * Delete one object from database
 *
 * @param options {Object or Number}
 Options:
   - where -> A hash with conditions (e.g. {name: 'foo'})
            OR an ID as integer
            OR a string with conditions (e.g. 'name="foo"').
            If you use a string, you have to escape it on your own.
   - limit -> The maximum count you want to get.
 *
 * @param cb {Function} Callback
 * @returns {String|Object|Array|Boolean|Number} Describe what it returns
 */
AppModel.destroy = function (options, cb) {
  var self = this
  // options is not a hash but an id
  if(typeof options === 'number')
    options = {where: options}
  else if ((typeof options === 'function') || (options == null) || (options == undefined)) {
    throw "No options are given";
  }

  options.limit = 1

  function callback(err, results) {
    //if (results && results.length != 0) {
      //// create new model instance from this data
      //var instance = self.build(results[0], {isNewRecord: false})
      //cb(err, instance);
    //} else {
      //cb(err, null);
    //}
    cb(err,null)
  }

  var query = QueryGenerator.deleteQuery(this.tableName, options.where, {limit: options.limit})
  return this.db.query(query, callback)
}

/**
 * Deletes all objects from database
 *
 * @see AppModel.destroy
 */
AppModel.destroyAll = function (options, cb) {
  var self = this
  function callback(err, results) {
    // create new array of model instances
    var arr = []

    //_.each(results, function (r) {
      //var instance = self.build(r, {isNewRecord: false})
      //arr.push(instance)
    //})
    cb(err, arr);
  }
  return this.db.query(QueryGenerator.deleteQuery(this.tableName, options.where), callback)
}

/**
 * Builds a picture url for model item
 *
 * @param size {String} thumb, medium, etc
 * @returns {String} url
 */
AppModel.prototype.pictureUrl = function (size) {
  return helper.pictureUrl(this, size)
}

/**
 * Builds a profile url for model item
 *
 * @returns {String} url
 */
AppModel.prototype.webUrl = function () {
  return helper.webUrl(this.api, this.id)
};
