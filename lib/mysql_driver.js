// Taken and adapted from sequelize

/**
 * Class that contains initialization of mysql connection
 */

var MysqlDriver = module.exports = function (database, user, password, options) {
  options = options || {};

  this.options = options;
  this.config = {
    database: database,
    user: user,
    password: (( (["", null, false].indexOf(password) > -1) || (typeof password == 'undefined')) ? null : password),
    host    : options.host || 'localhost',
    port    : options.port || 3306
  };
}

/**
 * Returns a MySQL client instance
 */
MysqlDriver.prototype.getClient = function () {
  var mysql = require("mysql");
  return mysql.createClient(this.config);
}

/**
 * Sends sql query to MySQL
 *
 * @param sql {String}
 * @returns this
 */
MysqlDriver.prototype.query = function (sql, cb) {
  var client = this.getClient();

  if (this.options.logging) {
    console.log('Executing: ' + sql);
  }

  // client.connect();
  client.query(sql, cb);
  client.end();

  return this;
}