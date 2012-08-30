var helper = require("test_helper")
  , gently = new (require('gently'))
  , should = require('should')
  , UserController = helper.controller('user')

var userController = new UserController();

/**
 * Tests methods of auth_system
 */
describe('user_controller', function () {
  it('should init functions', function () {
    var userController = new UserController();
    userController.forgottenPasswordPage = {bind: function () {return "forgottenPasswordPage"}}
    userController.forgottenPassword = {bind: function () {return "forgottenPassword"}}
    userController.registerPage = {bind: function () {return "registerPage"}}
    userController.register = {bind: function () {return "register"}}
    userController.activateUser = {bind: function () {return "activateUser"}}
    var app = {}

    gently.expect(app, 'get', function (route, action) {
      route.should.equal("/forgotten_password")
      action.should.equal("forgottenPasswordPage")
    })
    gently.expect(app, 'post', function (route, action) {
      route.should.equal("/forgotten_password")
      action.should.equal("forgottenPassword")
    })

    gently.expect(app, 'get', function (route, action) {
      route.should.equal("/register")
      action.should.equal("registerPage")
    })

    gently.expect(app, 'post', function (route, action) {
      route.should.equal("/register")
      action.should.equal("register")
    })

    gently.expect(app, 'get', function (route, action) {
      route.should.equal("/activate/:activation_code")
      action.should.equal("activateUser")
    })

    userController.init(app)
  })
  it('should forgottenPasswordPage should render forgotten_password_page with registration layout', function () {
    var req = 5
      , res = {}
      ;

    gently.expect(res, 'render', function (template, obj) {
      template.should.equal('user/forgotten_password_page');
      obj.req.should.equal(5);
      obj.layout.should.equal('layouts/registration')
    })

    userController.forgottenPasswordPage(req, res)
  })
  it('should registerPage should render register_page with registration layout', function () {
    var req = 5
      , res = {}
      ;

    gently.expect(res, 'render', function (template, obj) {
      template.should.equal('user/register_page');
      obj.req.should.equal(5);
      obj.layout.should.equal('layouts/registration')
      should.exist(obj.recaptcha)
    })

    userController.registerPage(req, res)
  })
  it('should register action when recaptcha is verified', function () {
    var req = {body: {email: "email", password: "password", confirmation: "password"}}
      , res = {}

    gently.expect(helper.mock("/lib/validator"), 'validateEmail', function (req, email) {
			return "email"
		})
    gently.expect(helper.mock("/lib/validator"), 'validatePassword', function (req, password, confirmation) {
			return "password"
		})
    gently.expect(helper.mock("/lib/recaptcha"), 'verify', function (req, fn) {
      fn(null);
    })
    gently.expect(userController, '_emailRegistration', function (req, fn) {
      fn();
    })
    gently.expect(res, 'redirect', function (path) {
      path.should.equal('/register');
    })

    userController.register(req, res);
  })
  it('should register action when recaptcha is NOT verified', function () {
    var flash = {}
      , req = { id: 7, flash: flash
							, body: {
									email: "email"
								, password: "password"
								, confirmation: "password"}
							}
      , res = {}

    gently.expect(helper.mock("/lib/validator"), 'validateEmail', function () {
			return "email"
		})
    gently.expect(helper.mock("/lib/validator"), 'validatePassword', function () {
			return "password"
		})
    gently.expect(helper.mock("/lib/recaptcha"), 'verify', function (req, fn) {
      fn(new Error("error"));
    })
    gently.expect(flash, 'setError', function (mes, fn) {
      mes.should.equal("error")
      fn()
    })
    gently.expect(res, 'redirect', function (path) {
      path.should.equal('/register');
    })

    userController.register(req, res);
  })
  it('should #_emailRegistration when user exists and already activated', function () {
    var User = {}
      , params = {email: "email", password: "password"}
      , flash = {}
      , req = {app: {User: User}, body: params, t: function (par) {return par}, flash: flash}
      , res = {}

    gently.expect(User, 'generateSalt', function (email) {
      email.should.equal("email")
      return "salt"
    })
    gently.expect(User, 'encrypt', function (password, salt) {
      password.should.equal("password")
      salt.should.equal("salt")
      return "cryptedPassword"
    })
    gently.expect(User, "find" , function (par, fn) {
      par.where.should.equal("email='email'")
      fn(null, {activation_code: null})
    })
    var next = gently.expect(function callback(err) {
      err.message.should.equal('registration.account_already_exists')
    })
    userController._emailRegistration(req, next);
  })
  it('should #_emailRegistration when user exists but not activated', function () {
    var User = {}
      , params = {email: "email", password: "password"}
      , flash = {}
      , req = {app: {User: User}, body: params, t: function (par) {return par}, flash: flash, lang: "ru"}
      , res = {}
      , userMock = {id: 10, activation_code: "activation_code"}

    gently.expect(User, 'generateSalt', function (email) {
      return "salt"
    })
    gently.expect(User, 'encrypt', function (password, salt) {
      return "cryptedPassword"
    })
    gently.expect(User, "find" , function (par, fn) {
      fn(null, userMock)
    })
    gently.expect(userMock, "updateAttributes" , function (obj, fn) {
      obj.salt.should.equal("salt")
      obj.crypted_password.should.equal("cryptedPassword")
      obj.person_type.should.equal("User")
      obj.language.should.equal("ru")
      fn(null)
    })
    gently.expect(flash, "setNotice" , function (par, fn) {
      par.should.equal('registration.pls_activate_account')
      fn()
    })
    var next = gently.expect(function callback(err) {
      should.not.exist(err)
    })
    gently.expect(helper.mock("/lib/email"), "signupNotification" , function (req, user) {
      user.id.should.equal(userMock.id)
    })

    userController._emailRegistration(req, next);
  })
  it('should #_emailRegistration when user does not exist', function () {
    var User = {}
      , params = {email: "email", password: "password"}
      , flash = {}
      , req = {app: {User: User}, body: params, t: function (par) {return par}, flash: flash, lang: "ru"}
      , res = {}
      , userMock = {id: 10, activation_code: "activation_code"}

    gently.expect(User, 'generateSalt', function (email) {
      return "salt"
    })
    gently.expect(User, 'encrypt', function (password, salt) {
      return "cryptedPassword"
    })
    gently.expect(User, "find" , function (par, fn) {
      fn(null, null)
    })
    gently.expect(User, "generateActivationCode" , function () {
      return "activation_code"
    })
    gently.expect(User, "create" , function (obj, fn) {
      obj.salt.should.equal("salt")
      obj.email.should.equal("email")
      obj.crypted_password.should.equal("cryptedPassword")
      obj.activation_code.should.equal("activation_code")
      obj.language.should.equal("ru")
      obj.person_type.should.equal("User")
      fn(null, userMock)
    })
    gently.expect(flash, "setNotice" , function (par, fn) {
      par.should.equal('registration.pls_activate_account<br /><br />login.spam_notice login.sportaxy_to_contacts_notice')
      fn()
    })
    var next = gently.expect(function callback(err) {
      should.not.exist(err)
    })
    gently.expect(helper.mock("/lib/email"), "signupNotification" , function (req, user) {
      user.id.should.equal(userMock.id)
    })

    userController._emailRegistration(req, next);
  })
  it('should forgottenPassword when user for email does not exists', function () {
    var User = {}
      , params = {email: "email"}
      , flash = {}
      , req = {app: {User: User}, body: params, t: function (par) {return par}, flash: flash}
      , res = {}
      ;

    gently.expect(helper.mock("/lib/validator"), 'validateEmail', function () {
			return "email"
		})
    gently.expect(User, "find", function (par, fn) {
      par.where.should.equal("email='email'")
      fn(null, null)
    })
    gently.expect(flash, "setError" , function (par, fn) {
      par.should.equal('login.new_password_email_failure')
      fn()
    })
    gently.expect(res, "redirect", function (path) {
      path.should.equal('/forgotten_password');
    })
    userController.forgottenPassword(req, res);
  })
  it('should forgottenPassword when user exists', function () {
    var User = {}
      , params = {email: "email"}
      , flash = {}
      , req = {app: {User: User}, body: params, t: function (par) {return par}, flash: flash}
      , res = {}
      , userMock = {id: "user"}

    gently.expect(helper.mock("/lib/validator"), 'validateEmail', function () {
			return "email"
		})
    gently.expect(User, "find", function (par, fn) {
      par.where.should.equal("email='email'")
      fn(null, userMock)
    })
    gently.expect(userMock, "createNewPassword", function () {
      return "password"
    })
    gently.expect(helper.mock("/lib/email"), "newPassword", function (req, user, pass) {
      user.id.should.equal("user")
      pass.should.equal("password")
      return ""
    })
    gently.expect(flash, "setNotice" , function (par, fn) {
      par.should.equal('login.new_password_sent_to_email<br /><br />login.spam_notice login.sportaxy_to_contacts_notice')
      fn()
    })
    gently.expect(res, "redirect", function (path) {
      path.should.equal('/forgotten_password');
    })
    userController.forgottenPassword(req, res);
  })
  it('should activateUser action when activation_code exists', function () {
    var User = {}
      , params = {activation_code: "activation_code"}
      , flash = {}
      , req = {app: {User: User}, params: params, t: function (par) {return par}, flash: flash}
      , res = {}
      , userMock = {id: "user"}
      ;

    gently.expect(User, "find", function (par, fn) {
      par.where.should.equal("activation_code='activation_code'")
      fn(null, userMock)
    })
    gently.expect(userMock, "activate", function () {})
    gently.expect(helper.mock("/lib/email"), "accountActivated", function (req, user) {
      user.id.should.equal("user")
    })
    gently.expect(res, "render", function (template, obj) {
      req.flash.notice.should.equal('registration.signup_complete')
      template.should.equal('user/activation_page');
      obj.layout.should.equal('layouts/registration')
    })
    userController.activateUser(req, res);
  })
  it('should activateUser action when activation_code does not exist', function () {
    var User = {}
      , params = {activation_code: ""}
      , flash = {}
      , req = {app: {User: User}, params: params, t: function (par) {return par}, flash: flash}
      , res = {}
      ;

    gently.expect(User, "find", function (par, fn) {
      par.where.should.equal("activation_code=''")
      fn(null, null)
    })
    gently.expect(res, "render", function (template, obj) {
      req.flash.error.should.equal('registration.activation_invalid')
      template.should.equal('user/activation_page');
      obj.layout.should.equal('layouts/registration')
    })
    userController.activateUser(req, res);
  })

})

