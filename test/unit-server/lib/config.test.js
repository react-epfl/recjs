var assert = require('assert')
  , config = require('../../lib/config')
  , should = require('should')


describe('config', function () {
  it('should settings for production database', function () {
    var production = config.getDbConfig().production;
    assert.equal(production.database, 'sportaxy_production');
    assert.equal(production.username, 'production');
    assert.equal(production.password, 'production');
  })
  it('should settings for development database', function () {
    var development = config.getDbConfig().development;
    assert.equal(development.database, 'sportaxy_development');
    assert.equal(development.username, 'root');
    assert.equal(development.password, '');
  })
  it('should settings for test database', function () {
    var development = config.getDbConfig().test;
    assert.equal(development.database, 'sportaxy_test');
    assert.equal(development.username, 'root');
    assert.equal(development.password, '');
  })
  it('should css assets config', function () {
    var css = config.getAssetsCSS()
    css.core[0].should.equal("logo")
  })
  it('should js assets config', function () {
    var js = config.getAssetsJS()
    js.core[0].should.equal("app")
  })
  it('should templates config', function () {
    var js = config.getTemplates()
    js.dash[0].should.equal("space")
  })
})

