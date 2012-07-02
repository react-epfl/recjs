var gently = new (require('gently'))
  , assert = require('assert')
  , should = require('should')
  , HomeController = require('../../app/controllers/home_controller')

var homeController = new HomeController();

/**
 * Tests methods of auth_system
 */
module.exports = {
  'test init functions': function () {
    var homeController = new HomeController();
    homeController.loginFromCookies = {bind: function () {return "loginCookie"}}
    homeController.index = {bind: function () {return "index"}}
    var app = {}

    gently.expect(app, 'get', function (route, loginCookie, index) {
      route.should.equal("/")
      loginCookie.should.equal("loginCookie")
      index.should.equal("index")
    })

    homeController.init(app)
  },
  'test index action when user not logged in': function () {
    var req = {}
    var res = {}
    gently.expect(res, "render", function (jade, params) {
      jade.should.equal("home/welcome")
      params.req.should.equal(req)
      params.layout.should.equal("layouts/welcome")
    })

    homeController.index(req, res)
  },
  'test index action when user is logged in': function () {
    var app = {Calendar: {}, Event: {}}
      , req = {currentUser: {id: 1}, app: app}
      , res = {}
      , cal = {id: 2}

    gently.expect(app.Calendar, "find", function (par, cb) {
      par.where.user_id.should.equal(1)
      cb(null, cal) // calendar id
    })
    gently.expect(app.Event, "plansAtDate", function (date, calId, cb) {
      calId.should.equal(2)
      cb(null, "today")
    })
    gently.expect(app.Event, "plansAtDate", function (date, calId, cb) {
      calId.should.equal(2)
      cb(null, "tomorrow")
    })
    gently.expect(app.Event, "soonestRaces", function (calId, cb) {
      calId.should.equal(2)
      cb(null, "reminder")
    })
    gently.expect(res, "render", function (jade, params) {
      jade.should.equal("home/dashboard")
      params.req.should.equal(req)
      var output = params.data
      output.today.should.equal("today")
      output.tomorrow.should.equal("tomorrow")
      output.reminder.should.equal("reminder")
      params.user.id.should.equal(1)
      should.exist(params.helper)
      params.layout.should.equal("layouts/dashboard")
    })

    homeController.index(req, res)
  },
}


