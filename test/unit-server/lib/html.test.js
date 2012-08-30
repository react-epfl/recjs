var helper = require("test_helper")
  , gently = new (require('gently'))
  , should = require('should')
  , htmlObj = helper.require('/lib/html')
  , fs = require('fs')
  , html
  , publicUrl = helper.fullPath("/public")

describe('html', function () {
  beforeEach(function () {
    // mock the config code
    gently.expect(helper.mock("/lib/config"), "getAssetsCSS", function () {
      return {myasset: ['first.css', 'second']}
    })
    gently.expect(helper.mock("/lib/config"), "getAssetsJS", function () {
      return {myasset: ['first', 'second.js']}
    })
    gently.expect(helper.mock("/lib/config"), "getTemplates", function () {
      return {myasset: ['first', 'second.jade']}
    })
    html = htmlObj.init()
  })

  it('should generate one js file when env=production', function () {
    var htmlCode = html.javascripts("production", "myasset");
    htmlCode.should.equal('<script src="http://static2.spacilla.com/cache/myasset.min.js"></script>');
  })
  it('should generate one css file when env=production', function () {
    var htmlCode = html.stylesheets("production", "myasset");
    htmlCode.should.equal('<link href="http://static2.spacilla.com/cache/myasset.min.css" rel="stylesheet">');
  })
  it('should generate links to N css files when env!=production', function () {
    var htmlCode = html.stylesheets('development', "myasset");

    htmlCode.should.equal( '<link href="/css/first.css" rel="stylesheet">'
                         + '<link href="/css/second.css" rel="stylesheet">')
  })
  it('should generate links to N js files when env!=production', function () {
    var htmlCode = html.javascripts('development', "myasset");

    htmlCode.should.equal( '<script src="/js/first.js"></script>'
                         + '<script src="/js/second.js"></script>');
  })
  it('should generation of cached assets based on config files', function () {
    // create temporal files
    var firstCSS = fs.openSync("./public/css/first.css", "w")
    fs.writeSync(firstCSS, "firstCSS");
    var secondCSS = fs.openSync("./public/css/second.css", "w")
    fs.writeSync(secondCSS, "secondCSS");
    var firstJS = fs.openSync("./public/js/first.js", "w")
    fs.writeSync(firstJS, "firstJS", null, 'utf8');
    var secondJS = fs.openSync("./public/js/second.js", "w")
    fs.writeSync(secondJS, "secondJS", null, 'utf8');
    var firstTempl = fs.openSync("./public/views/first.jade", "w")
    fs.writeSync(firstTempl, "span name", null, 'utf8');
    var secondTempl = fs.openSync("./public/views/second.jade", "w")
    fs.writeSync(secondTempl, "span address", null, 'utf8')


    html.buildCachedAssets()

    // remove temporal files
    fs.unlinkSync("./public/css/first.css")
    fs.unlinkSync("./public/css/second.css")
    fs.unlinkSync("./public/js/first.js")
    fs.unlinkSync("./public/js/second.js")
    fs.unlinkSync("./public/views/first.jade")
    fs.unlinkSync("./public/views/second.jade")

    // check if a cached file was created (exists)
		;(function(){
			fs.openSync("./public/cache/myasset_all.css", 'r');
			fs.openSync("./public/cache/myasset_all.js", 'r');
		}).should.not.throw()

    // check if generated files content is correct
    var content = fs.readFileSync("./public/cache/myasset_all.css", 'utf8');
    fs.unlinkSync("./public/cache/myasset_all.css")
    content.should.equal("firstCSSsecondCSS");

    content = fs.readFileSync("./public/cache/myasset_all.js", 'utf8');
    fs.unlinkSync("./public/cache/myasset_all.js")
    content.should.equal("firstJSsecondJS");

    content = fs.readFileSync("./public/cache/templ_myasset_all.js", 'utf8');
    fs.unlinkSync("./public/cache/templ_myasset_all.js")
    content.should.equal('app.Templates = {  "first": function anonymous(locals, attrs, escape, rethrow) {\nvar attrs = jade.attrs, escape = jade.escape, rethrow = jade.rethrow;\nvar buf = [];\nwith (locals || {}) {\nvar interp;\nbuf.push(\'<span>name</span>\');\n}\nreturn buf.join("");\n},  "second": function anonymous(locals, attrs, escape, rethrow) {\nvar attrs = jade.attrs, escape = jade.escape, rethrow = jade.rethrow;\nvar buf = [];\nwith (locals || {}) {\nvar interp;\nbuf.push(\'<span>address</span>\');\n}\nreturn buf.join("");\n},}');
  })
  it('should templates, should generate one script tag when env=production', function () {
    var htmlCode = html.templates("production", "myasset");
    htmlCode.should.equal('<script src="http://static0.spacilla.com/cache/templ_myasset.min.js"></script>');
  })
  it('should templates, should generate a template and a script tag when env!=production', function () {
    var firstJS = fs.openSync("./public/views/first.jade", "w")
    fs.writeSync(firstJS, "span name", null, 'utf8');
    var secondJS = fs.openSync("./public/views/second.jade", "w")
    fs.writeSync(secondJS, "span address", null, 'utf8')

    var htmlCode = html.templates('development', "myasset");
    htmlCode.should.equal('<script src="/js/templates/myasset.js"></script>')

    var content = fs.readFileSync("./public/js/templates/myasset.js", 'utf8')
    fs.unlinkSync("./public/js/templates/myasset.js")
    content.should.equal( 'app.Templates = {'
                        + '  "first": function anonymous(locals, attrs, escape, rethrow) {\nvar attrs = jade.attrs, escape = jade.escape, rethrow = jade.rethrow;\nvar __jade = [{ lineno: 1, filename: "./public/views/first.jade" }];\ntry {\nvar buf = [];\nwith (locals || {}) {\nvar interp;\n__jade.unshift({ lineno: 1, filename: __jade[0].filename });\n__jade.unshift({ lineno: 1, filename: __jade[0].filename });\nbuf.push(\'<span>name\');\n__jade.unshift({ lineno: undefined, filename: __jade[0].filename });\n__jade.shift();\nbuf.push(\'</span>\');\n__jade.shift();\n__jade.shift();\n}\nreturn buf.join("");\n} catch (err) {\n  rethrow(err, __jade[0].filename, __jade[0].lineno);\n}\n},'
                        + '  "second": function anonymous(locals, attrs, escape, rethrow) {\nvar attrs = jade.attrs, escape = jade.escape, rethrow = jade.rethrow;\nvar __jade = [{ lineno: 1, filename: "./public/views/second.jade" }];\ntry {\nvar buf = [];\nwith (locals || {}) {\nvar interp;\n__jade.unshift({ lineno: 1, filename: __jade[0].filename });\n__jade.unshift({ lineno: 1, filename: __jade[0].filename });\nbuf.push(\'<span>address\');\n__jade.unshift({ lineno: undefined, filename: __jade[0].filename });\n__jade.shift();\nbuf.push(\'</span>\');\n__jade.shift();\n__jade.shift();\n}\nreturn buf.join("");\n} catch (err) {\n  rethrow(err, __jade[0].filename, __jade[0].lineno);\n}\n},'
                        + '}'
                        )

    fs.unlinkSync("./public/views/first.jade")
    fs.unlinkSync("./public/views/second.jade")
  })
  it('should minifyAssets', function (done) {
    var js = fs.openSync("./public/cache/test_js_all.js", "w")
    fs.writeSync(js, "var a, b\n var hello", null, 'utf8');
    var css = fs.openSync("./public/cache/test_css_all.css", "w")
    fs.writeSync(css, "/* hello comment */\n.id \n{\n color: white}", null, 'utf8')

    html.minifyAssets('cache', false, function (par) {
      var content = fs.readFileSync("./public/cache/test_js.min.js", 'utf8')
      content.should.equal( 'var a,b,hello')

      content = fs.readFileSync("./public/cache/test_css.min.css", 'utf8')
      content.should.equal( '.id{color:white}')

      fs.unlinkSync("./public/cache/test_js.min.js")
      fs.unlinkSync("./public/cache/test_css.min.css")

      ;(function(){
        fs.openSync("./public/cache/test_js_all.js")
      }).should.throw()
      ;(function(){
        fs.openSync("./public/cache/test_css_all.css")
      }).should.throw()

      done()
    })
  })
})

