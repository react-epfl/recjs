process.env.NODE_ENV = 'test';

var app = require('../app')
  , assert = require('assert')
  ;

module.exports = {
  'POST /social.json': function () {
      assert.response(app, {
          url: '/social.json',
          method: 'POST',
          data: JSON.stringify({ document: { title: 'Test' } }),
          headers: { 'Content-Type': 'application/json' }
        }, {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        },

        function (res) {
          var document = JSON.parse(res.body);
          assert.equal('Test', document.title);
        });
    }
}