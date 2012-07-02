var assert = require('assert')
  , config = require('../../lib/config')
  , should = require('should')


module.exports = {
  'test settings for production database': function () {
    var production = config.getDbConfig().production;
    assert.equal(production.database, 'sportaxy_production');
    assert.equal(production.username, 'production');
    assert.equal(production.password, 'production');
  },
  'test settings for development database': function () {
    var development = config.getDbConfig().development;
    assert.equal(development.database, 'sportaxy_development');
    assert.equal(development.username, 'root');
    assert.equal(development.password, '');
  },
  'test settings for test database': function () {
    var development = config.getDbConfig().test;
    assert.equal(development.database, 'sportaxy_test');
    assert.equal(development.username, 'root');
    assert.equal(development.password, '');
  },
  'test css assets config': function () {
    var css = config.getAssetsCSS()
    css.core[0].should.equal("logo")
  },
  'test js assets config': function () {
    var js = config.getAssetsJS()
    js.core[0].should.equal("app")
  },
  'test templates config': function () {
    var js = config.getTemplates()
    js.dash[0].should.equal("space")
  },
};
