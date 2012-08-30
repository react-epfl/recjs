var helper = require("test_helper")
  , gently = new (require('gently'))
  , should = require('should')
  , MysqlDriver = helper.require('/lib/mysql_driver')

describe('mysql_driver', function () {
  it('should MysqlDriver() constructor', function () {
    var options = {host: "127.0.0.1"}
    var mysql = new MysqlDriver("db", "user", "pass", options);
    mysql.config.database.should.equal("db")
    mysql.config.user.should.equal("user")
    mysql.config.password.should.equal("pass")
    mysql.config.host.should.equal("127.0.0.1")
    mysql.config.port.should.equal(3306)
  })
  it('should MysqlDriver#getClient', function () {
    var mysql = new MysqlDriver("db", "user", "pass");
    var client = mysql.getClient();
    client.host.should.equal("localhost")
  })
  it('should MysqlDriver#query logging enabled', function () {
    var gently = new (require('gently'))

    var options = {host: "127.0.0.1"}
    var mysql = new MysqlDriver("db", "user", "pass", {logging: true});
    var mockClient = {}
    gently.expect(mysql, 'getClient', function () {
      return mockClient;
    });
    gently.expect(console, "log", function (par) {
      par.should.equal("Executing: sql")
    })
    gently.expect(mockClient, 'query');
    gently.expect(mockClient, 'end');

    mysql.query("sql", "callback");
  })
  it('should MysqlDriver#query logging disabled', function () {
    var gently = new (require('gently'))

    var options = {host: "127.0.0.1"}
    var mysql = new MysqlDriver("db", "user", "pass");
    var mockClient = {}
    gently.expect(mysql, 'getClient', function () {
      return mockClient;
    });
    gently.expect(mockClient, 'query', function (sql, cb) {
      sql.should.equal("sql")
      cb.should.equal("callback")
    });
    gently.expect(mockClient, 'end');

    mysql.query("sql", "callback");
  })
})

