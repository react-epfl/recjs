var helper = require("test_helper")
  , gently = new (require('gently'))
  , should = require('should')
  , connect_rails = helper.require('/lib/connect-rails')

// mocking things

describe('connect-rails', function () {
  it('should Rails Session found', function () {
    var session = connect_rails.session({key: "_sportaxy_session"});
    var mockSession = {
      find: function (id, fn) {
        // session container for user = 2
        fn(null, {data: "eyJyZXR1cm5fdG8iOiIvY29tbXVuaXR5L3VzZXIvMiIsInVzZXIiOjIsInNsaWRpbmdfc2Vzc2lvbl9leHBpcmVzX2F0IjoiMjAxMS8wNy8xNSAyMToyNDoyMSArMDIwMCIsImZsYXNoIjp7fX0="});
      },
      asRequestObject: function (id, data) {return {user: 2, session_id: "session_id"}}
    };
    var app = {Session: mockSession}
    var req = {cookies: {"_sportaxy_session": "session_id"}, app: app};

    session(req, null, function () { // next callback
      req.session.user.should.equal(2);
      req.session.session_id.should.equal("session_id");
    });
  })
  it('should Rails Session not found, create new', function () {
    var session = connect_rails.session({key: "_sportaxy_session"});
    var mockSession = {
      find: function (id, fn) {
        fn(null, null);
      },
      generateNew: function () {
        return {session_id: "session_id", data: {user: 2}};
      },
      build: function (session) {
        return {save: function (fn) {fn();}};
      },
      asRequestObject: function (id, data) {return {user: 2, session_id: "session_id"}}
    };
    var app = {Session: mockSession};

    var req = {cookies: {"_sportaxy_session": "session_id"}, app: app};
    var resMock = {cookie: function (name, value, obj) {
      // cookie for session is set
      name.should.equal("_sportaxy_session");
      value.should.equal("session_id");
      obj.httpOnly.should.equal(true)
      obj.path.should.equal("/")
    }};

    session(req, resMock, function () { // next callback
      // session object is set
      req.session.user.should.equal(2);
      req.session.session_id.should.equal("session_id");
    });
  })
  it('should MySQL initialization', function () {
    var mysql = 'mysql';
    var req = res = {};
    var database = connect_rails.database(mysql);

    database(req, res, function () {
      req.db.should.equal('mysql');
    })
  })
  it('should currentUser when session is defined', function () {
    var currentUser = connect_rails.currentUser();

    var app = {User: {find: function (user_id, fn) {
      fn(null, {id: 2});
    }}}

    var req = {session: {user_id: 2}, app: app};
    currentUser(req, null, function () {});

    req.currentUser.id.should.equal(2);
  })
  it('should currentUser when no session', function () {
    var currentUser = connect_rails.currentUser();

    var req = {session: {}};
    currentUser(req, null, function () {});

    should.not.exist(req.currentUser);
    // currentUser.should.equal(undefined);
  })
  it('should set currentLang when cookie is defined', function () {
    var currentLang = connect_rails.currentLang();

    var req = {currentUser: undefined, cookies: {language: 'ru'}};
    var res = {};
    currentLang(req, res, function () {});

    req.lang.should.equal('ru');
    // currentUser.should.equal(undefined);
  })
  it('should set currentLang when cookie is not defined (default lang is en)', function () {
    var currentLang = connect_rails.currentLang();

    var req = {currentUser: undefined, cookies: {language: null}};
    var res = {};
    gently.expect(res, 'cookie', function (name, value, obj) {
      name.should.equal('language');
      value.should.equal('en'); //default lang
      obj.httpOnly.should.equal(true)
      obj.path.should.equal("/")
    })

    currentLang(req, res, function () {});

    req.lang.should.equal('en');
  })
  it('should translationFunc for req.lang', function () {
    var app = "app";
    var req = {lang: "ru", app: app};

    var translationFunc = connect_rails.translationFunc(app);
    var fn = function () {}

    // console.log(gently);
    gently.expect(helper.mock("/lib/i18n"), 'setTranslateFunc', function (app, lang) {
      app.should.equal("app");
      lang.should.equal("ru");

      return fn;
    });
    // console.log(gently);
    translationFunc(req, null, function () {});

    req.t.should.equal(fn);
  })
  it('should flash is added to req', function () {
    var flashFunc = connect_rails.flash();

    gently.expect(helper.mock("/lib/flash"), 'build', function (req) {
      return {};
    });

    var app = {Session: {}}
    var req = {app: app};

    gently.expect(app.Session, 'updateReqSession', function (req, hash, fn) {
      hash.flash_notice.should.equal("");
      hash.flash_error.should.equal("");
      fn()
    })

    var next = gently.expect(function (par) {})

    var res = {};
    flashFunc(req, res, next);
  })
  it('should currentLang update user language when his language is different from cookies', function () {
    var currentLang = connect_rails.currentLang()
  	var gently = new (require('gently'))

    var req = {currentUser: {language: 'ru'}, cookies: {language: 'en'}};
    gently.expect(req.currentUser, 'updateAttributes', function (opts) {
      opts.language.should.equal('en');
    });

    var res = {};
    currentLang(req, res, function () {});
  })
})

