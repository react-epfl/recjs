var helper = require("test_helper")
  , gently = new (require('gently'))
  , should = require('should')
  , config = helper.require('/lib/config')

describe('config', function () {
  it('should settings for production database', function () {
    var production = config.getDbConfig().production;
    production.database.should.equal('recjs_production');
    production.username.should.equal('production');
    production.password.should.equal('production');
  })
  it('should settings for development database', function () {
    var development = config.getDbConfig().development;
    development.database.should.equal('recjs_development');
    development.username.should.equal('root');
    development.password.should.equal('');
  })
  it('should settings for test database', function () {
    var development = config.getDbConfig().test;
    development.database.should.equal('recjs_test');
    development.username.should.equal('root');
    development.password.should.equal('');
  })
  it('should css assets config', function () {
    var css = config.getAssetsCSS()
    css.shared[0].should.equal("logo")
  })
  it('should js assets config', function () {
    var js = config.getAssetsJS()
    js.shared[0].should.equal("app")
  })
  it('should templates config', function () {
    var js = config.getTemplates()
    js.dash[0].should.equal("space")
  })
})

