var crypto = require('crypto')
  , helper = require('./helper')
  ;

if (global.GENTLY) {require = GENTLY.hijack(require)};

/**
 * Gets session object from the database, parses it and sets req.session
 */
exports.session = function (options) {
    options = options || {};

    return function session(req, res, next) {
      var app = req.app;
      // init important variables

      // get session key from cookies
      var session_id = req.cookies[options.key];

      app.Session.find({where: {session_id: session_id}}, function (err, session) {
        if (err) {throw err}
        if (session) {
          req.session = app.Session.asRequestObject(session_id, session.data); // found session
          next();
        } else {
          // if session is not found, we should create a new session for guest!!!
          var sessionObj = app.Session.generateNew();

          app.Session.build(sessionObj).save(function (err, session) {

            // set session object in request
            req.session = app.Session.asRequestObject(sessionObj.session_id, sessionObj.data);
            // set session cookie
            res.cookie(options.key, sessionObj.session_id,
                { expires: new Date(Date.now() + 90000000), httpOnly: true , path: "/"});
            next();
          })
          // res.redirect('/'); // session info is not found
        }
      });
    };
};

/**
 * Adds mysql object to req
 */
exports.database = function (db) {
    return function database(req, res, next) {
      // init important variables
      req.db = db;
      next();
    };
};

/**
 * Sets the req.currentUser variable based on session object
 */
exports.currentUser = function () {
  return function currentUser(req, res, next) {
    var app = req.app;

    var user_id = req.session.user_id;
    if (user_id) {
      app.User.find(user_id, function (err, user) {
        req.currentUser = user;
        next();
      })
    } else { // user not found
      req.currentUser = undefined;
      next();
    }
  }
}

/**
 * Sets the app language req.lang from cookies variable
 */
exports.currentLang = function () {
  return function currentLang(req, res, next) {
    if (req.cookies.language) { // language already defined
      req.lang = req.cookies.language;
    } else { // not defined yet, then define language cookie as "en"
      // set expiration time to 4 month
      res.cookie('language', "en", { expires: new Date(Date.now() + 90000000), httpOnly: true , path: "/"});
      req.lang = "en";
    }

    // update currentUser language with new value
    if (req.currentUser && (req.currentUser.language !== req.lang)) {
      req.currentUser.updateAttributes({language: req.lang}, function (err) {})
    }

    next();
  }
}

/**
 * Sets the translation function req.t based on req.lang
 */
exports.translationFunc = function (app) {
  var i18n = require('./i18n');
  return function translationFunc(req, res, next) {
    var app = req.app;

    // add translation function to request
    req.t = i18n.setTranslateFunc(app, req.lang);

    next();
  }
}

/**
 * Adds the flash function to req
 *
 * The flash function sets the current values of flash into req.flash object
 * and clears the session from flash
 */
exports.flash = function (app) {
  var Flash = require('./flash')
  return function flash(req, res, next) {
    var app = req.app;
    // get flash object from session and set flash object
    // append to req object
    req.flash = Flash.build(req);
    // flash.notice = req.session.flash_notice;
    // flash.error = req.session.flash_error;

    // append to req object
    // req.flash = flash;

    // remove flash info from session
    var hash = {flash_notice: "", flash_error: ""}
    app.Session.updateReqSession(req, hash, next);
  }
}
