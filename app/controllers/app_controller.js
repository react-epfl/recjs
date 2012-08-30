/**
 * Applications controller
 */

function AppController() {}
module.exports = AppController;

AppController.redirectBackOrDefault = function (req, res, defaultUrl) {
  var app = req.app;
  var returnTo = req.session.return_to
  app.Session.updateReqSession(req, {return_to: ""}, function () {
    if (returnTo) {
      res.redirect(returnTo) // redirect to saved url
    } else {
      res.redirect(defaultUrl) // redirect to specified url
    }
  });
}

/**
 * If user is not already signed in, stop him from accessing the resource
 * and redirect to login page!!
 */
AppController.prototype.loginRequired = function (req, res, next) {
  var app = req.app;

  // if (email && passwd)
  //   self.current_user =  User.authenticate(email, passwd) || :false
  //    already_logged_in = false
  // else
  //    already_logged_in = true
  // end
  var self = this

  // Set return_to url into session
  app.Session.updateReqSession(req, {return_to: req.url}, function () {
    if (self.loggedIn(req)) {
      next(); // user logged in, pass request further
    } else {
      // not logged in, redirect to login page
      res.redirect('/login');
    }
  });

};

/**
 * When called with before_filter :login_from_cookie will check for an :auth_token
 * cookie and log the user back in if apropriateSets req.currentUser if user can be logged into
 */
AppController.prototype.loginFromCookies = function (req, res, next) {
  var app = req.app;

  var authToken = req.cookies.auth_token;
  if (authToken === undefined || req.currentUser !== undefined) {next();return;}

  var _this = this;
  app.RememberMeToken.userByToken(authToken, function (user, token) {
    if (user) {
      // update current_user
      _this.updateCurrentUser(req, res, user, function () {
        // update token with new value and set cookies
        app.RememberMeToken.updateToken(user, token, function (newToken) {
          // send newly generated token
          res.cookie("auth_token", newToken.value, {expires: new Date(newToken.expiresAt) });
          next();
        });
      });
    } else {
      next();
    }

  });
};

/**
 * Updates req.currentUser to new value and adds this user into session
 *
 * @param req {Object} Request object where to add currentUser
 */
AppController.prototype.updateCurrentUser = function (req, res, user, cb) {
  var app = req.app;

  if (user) {
    // add user and return_to url into session object
    var obj = {user_id: user.id, return_to: req.url}
    app.Session.updateReqSession(req, obj, function () {
      req.currentUser = user;
      cb()
    });
  } else {
    req.currentUser = undefined;
    cb()
  }
};


/**
 * Checks whether user is logged in or not
 *
 * @returns {Boolean}
 */
AppController.prototype.loggedIn = function (req) {
  return (req.currentUser) ? true : false;
};
