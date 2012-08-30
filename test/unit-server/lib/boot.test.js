var helper = require("test_helper")
  , gently = new (require('gently'))
  , should = require('should')
  , boot = helper.require('/config/boot')

describe('boot', function () {
  it('should Boot loads social_controller', function () {
    var count = 0;
    var app = {
      get: function (route) {
        if (route === "/social.:format?") {
          count = 1;
        }
      }
    , put: function () {}
    , post: function () {}
    , options: function (route) {}
    };

    boot.start(app);

    setTimeout(function () {
      count.should.equal(1); // social.:format? is defined!
    }, 1000);
  })
  it('should Boot loads remember_me_token model', function () {
    var app = {
      name: "my_app"
    , get: function (route) {}
    , put: function (route) {}
    , post: function (route) {}
    , options: function (route) {}
    , db: "mysql"
    };

    boot.start(app);

    setTimeout(function () {
      should.exist(app.RememberMeToken);
      app.RememberMeToken.tableName.should.equal("remember_me_tokens")
      app.RememberMeToken.db.should.equal("mysql")
      app.RememberMeToken.app.name.should.equal("my_app")
      app.RememberMeToken.classOf.should.equal("remember_me_token")
      app.RememberMeToken.prototype.classOf.should.equal("remember_me_token")
      app.RememberMeToken.prototype.tableName.should.equal("remember_me_tokens")
      app.RememberMeToken.prototype.db.should.equal("mysql")
      app.RememberMeToken.prototype.app.name.should.equal("my_app")

    }, 1000);

  })

})

