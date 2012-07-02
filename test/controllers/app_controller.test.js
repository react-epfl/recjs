var gently = new (require('gently'))
  , assert = require('assert')
  , should = require('should')
  , AppController = require('../../app/controllers/app_controller')
  ;

var appController = new AppController();

/**
 * Tests methods of auth_system
 */
module.exports = {
  'test loggedIn req.currentUser exists': function () {

    var req = {};
    req.currentUser = {id: 2};
    appController.loggedIn(req).should.equal(true);
  },
  'test loggedIn req.currentUser does not exist': function () {

    var req = {};
    appController.loggedIn(req).should.equal(false);
  },
  'test updateCurrentUser when user is undefined': function () {
    var req = {}
    appController.updateCurrentUser(req, null, null, function () {
      should.not.exist(req.currentUser);
    });
  },
  'test updateCurrentUser when user is defined': function () {
    var sessionMock = {};
    var app = {Session: sessionMock};

    gently.expect(sessionMock, "updateReqSession", function (req, obj, fn) {
      obj.user_id.should.equal(5);
      obj.return_to.should.equal("url");
      fn()
    })
    var next = gently.expect(function () {
      req.currentUser.id.should.equal(5)
    })
    var user = {id: 5};
    var req = {url: "url", app: app};
    appController.updateCurrentUser(req, null, user, next);

  },
  'test loginFromCookies when no cookies defined': function () {
    var req = {cookies: {}};

    appController.loginFromCookies(req, null, function () {});
    should.not.exist(req.currentUser);
  },
  'test loginFromCookies when cookies defined and user not found': function () {
    var userMock = null;
    var tokenMock = null;

    var RememberMeTokenMock = {
      userByToken: function (authToken, fn) {
        fn(userMock, tokenMock);
      },
    };
    var app = {RememberMeToken: RememberMeTokenMock};

    var req = {cookies: "cookie", app: app};
    appController.loginFromCookies(req, null, function () {});
    // user not defined
    should.not.exist(req.currentUser);
  },
  'test loginFromCookies when cookies defined and user found': function () {
    var userMock = "user";
    var tokenMock = {};
    var newTokenMock = {value: "token", expiresAt: new Date()};

    var RememberMeTokenMock = {
      userByToken: function (authToken, fn) {
        fn(userMock, tokenMock);
      },
      updateToken: function (user, token, fn) {
        fn(newTokenMock);
      },
    };
    var app = {RememberMeToken: RememberMeTokenMock};
    appController.updateCurrentUser = function () {req.currentUser = "user"};

    var req = {cookies: {auth_token: "token"}, app: app};
    var res = {cookie: function (name, value, expiresAt) {}};

    appController.loginFromCookies(req, res, function () {});
    // user defined
    should.exist(req.currentUser);
    req.currentUser.should.equal("user");
    // cookies set
  },
  'test loginRequired when user is logged in already': function () {
    // !!!order of expects matters!!!
    var session = {};
    var app = {Session: session};
    var req = {url: "url", app: app};
    var appController = new AppController();

    gently.expect(session, 'updateReqSession', function (req, sesObj, fn) {
      req.url.should.equal("url");
      sesObj.return_to.should.equal("url");
      fn();
    });

    gently.expect(appController, 'loggedIn', function (req) {
      return true;
    });

    var next = gently.expect(function (req) {});

    // calls update session and then next function
    appController.loginRequired(req, null, next);
  },
  'test loginRequired redirect when user is not logged in': function () {
    // !!!order of expects matters!!!
    var session = {};
    var app = {Session: session};
    var appController = new AppController();

    gently.expect(session, 'updateReqSession', function (req, sesObj, fn) {
      req.url.should.equal("url");
      sesObj.return_to.should.equal("url");
      fn()
    });
    gently.expect(appController, 'loggedIn', function (req) {
      return false; // user not loggedIn
    });

    var res = {};
    var req = {url: "url", app: app}
    gently.expect(res, 'redirect', function (url) {
      url.should.equal("/login")
    })
    // calls update session and then next function
    appController.loginRequired(req, res, function () {});
  },
  'test .redirectBackOrDefault when NO return_to redirects to default': function () {
    var app = {Session: {}}
    var req = {app: app, session: {return_to: ""}}
      , res = {}

    gently.expect(app.Session, 'updateReqSession', function (req, hash, fn) {
      hash.return_to.should.equal('')
      fn()
    })
    gently.expect(res, 'redirect', function (url) {
      url.should.equal('default')
    })

    AppController.redirectBackOrDefault(req, res, "default")
  },
  'test .redirectBackOrDefault when return_to is DEFINED redirects to it': function () {
    var app = {Session: {}}
    var req = {app: app, session: {return_to: "return_to"}}
      , res = {}

    gently.expect(app.Session, 'updateReqSession', function (req, hash, fn) {
      hash.return_to.should.equal('')
      fn()
    })
    gently.expect(res, 'redirect', function (url) {
      url.should.equal('return_to')
    })

    AppController.redirectBackOrDefault(req, res, "default")
  },

};