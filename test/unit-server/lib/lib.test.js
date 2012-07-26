var assert = require('assert')
  , should = require('should')
  , helper = require('../../lib/helper')

describe('lib', function () {

  it('should toSequelizeMethods', function () {
    var ModelMethods = function () {};
    ModelMethods.prototype.instanceMethod = function (arg) {return "instance";};
    ModelMethods.classMethod = function (arg) {return "class";};

    var obj = helper.toSequelizeMethods(ModelMethods);
    should.exist(obj.classMethods.classMethod);
    should.exist(obj.instanceMethods.instanceMethod);
  })
  it('should inherits check if inheritance is done properly', function () {
    var Parent = function () {};
    Parent.prototype.instanceMethod = function (arg) { return "instance";};
    Parent.classMethod = function (arg) {  return "class";};

    var Child = function () {};
    helper.inherits(Child, Parent);

    should.exist(Child.classMethod);
    should.exist(Child.prototype.instanceMethod);
  })
  it('should randomString', function () {
    var randomStr = helper.randomString(192);
    randomStr.length.should.equal(32);
  })
  it('should decodeJsonBase64', function () {
    var str = "eyJyZXR1cm5fdG8iOiIvdXNlci8yIiwidXNlciI6Mn0="
    var obj = helper.decodeJsonBase64(str);
    obj.user.should.equal(2);
    obj.return_to.should.equal('/user/2');
  })
  it('should encodeJsonBase64', function () {
    var obj = {
      return_to: '/user/2',
      user: 2
    };
    var str = helper.encodeJsonBase64(obj);
    str.should.equal("eyJyZXR1cm5fdG8iOiIvdXNlci8yIiwidXNlciI6Mn0=");

  })
  it('should camelize without uppercase for first letter', function () {
    var str = "function_hello_world";
    var camel = helper.camelize(str, false);
    camel.should.equal("functionHelloWorld");
  })
  it('should camelize with uppercase for first letter', function () {
    var str = "class_hello_world";
    var camel = helper.camelize(str, true);
    camel.should.equal("ClassHelloWorld");
  })
  it('should toSqlDate', function () {
    var date = new Date("2011-09-25 19:15:43")
    var sqlDate = helper.toSqlDate(date)
    sqlDate.should.equal("2011-09-25 19:15:43");
  })
  it('should toSqlDateNoTime', function () {
    var date = new Date("2011-09-25 19:15:43")
    var sqlDate = helper.toSqlDateNoTime(date)
    sqlDate.should.equal("2011-09-25 00:00:00");
  })
  it('should secondsToHourmin when time is zero', function () {
    var time = helper.secondsToHourmin(0);
    time.should.equal("0:00");
  })
  it('should secondsToHourmin when empty parameter is specified', function () {
    var time = helper.secondsToHourmin(0, true);
    time.should.equal("");
  })
  it('should secondsToHourmin normal work', function () {
    var time = helper.secondsToHourmin(7270);
    time.should.equal("2:01");
  })
  it('should webUrl', function () {
    var url = helper.webUrl("events", 10);
    url.should.equal("/events/10");
  })
  it('should pictureUrl no params', function () {
    var url = helper.pictureUrl()
    url.should.equal("")
  })
  it('should pictureUrl + user, no size', function () {
    var userMock = {id: 1, classOf: "user"}
      , url = helper.pictureUrl(userMock)
    url.should.equal("/img/default/thumb_user.png")
  })
  it('should pictureUrl + user, + size', function () {
    var userMock = {id: 1, picture: "user.png", classOf: "user"}
      , url = helper.pictureUrl(userMock, "medium")
    url.should.equal("/user/1/medium_user.png")
  })
})


