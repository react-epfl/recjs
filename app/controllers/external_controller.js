/**
 * External controller
 *
 * populates the database with apps and widgets from WidgetStore
 * allows to retrieve apps/widgets in a paginated way
 */

if (global.GENTLY) {require = GENTLY.hijack(require)};

var inherits = require('util').inherits
  , nodemailer = require('nodemailer')
  , Seq = require("seq")
  , helper = require('helper')
  , _ = require("underscore")._

function ExternalController() {}
module.exports = ExternalController;

ExternalController.prototype.init = function (app) {
  // "/external/apps?limit=10&offset=11&query=apple"
  app.get( '/external/populate_apps'
         , this.populate_apps.bind(this)
         )
  app.get( '/external/populate_bundles'
         , this.populate_bundles.bind(this)
         )
  app.get( '/external/apps'
         , this.apps.bind(this)
         )
  app.get( '/external/bundles'
         , this.bundles.bind(this)
         )
  //app.get( '/external/bundle/'
         //, this.rebuild.bind(this)
         //)

};

// populates the db with apps and bundles from widget store
// sparql endpoint: http://role-widgetstore.eu/simplerdf/sparql
// query is in apps.sparql file
ExternalController.prototype.populate_apps = function (req, res) {
  var app = req.app

  var http = require("http")
    , data = ""

  var options =
    { host: 'role-widgetstore.eu'
    , port: 80
    , path: '/simplerdf/sparql?query=prefix+dc%3A+<http%3A%2F%2Fpurl.org%2Fdc%2Fterms%2F>%0D%0Aprefix+role%3A+<http%3A%2F%2Fpurl.org%2Frole%2Fterms%2F>%0D%0Aprefix+foaf%3A+<http%3A%2F%2Fxmlns.com%2Ffoaf%2F0.1%2F>%0D%0ASELECT+%3Ftitle+%3Fsource+%3Fdescription+%3Fthumbnail+%3Fscreenshot%0D%0A%7B%0D%0A%3Ftool+a+role%3AOpenSocialGadget+.%0D%0AOPTIONAL+%7B%3Ftool+dc%3Atitle+%3Ftitle+.%7D%0D%0AOPTIONAL+%7B%3Ftool+dc%3Asource+%3Fsource+.%7D%0D%0AOPTIONAL+%7B%3Ftool+dc%3Adescription+%3Fdescription+.%7D%0D%0AOPTIONAL+%7B%3Ftool+foaf%3Aimg+%3Fscreenshot+.%7D%0D%0AOPTIONAL+%7B%3Ftool+foaf%3Adepiction+%3Fthumbnail+.%7D%0D%0A%0D%0A%7D%0D%0A&output=json'
    }

  // get data from widget store
  http.get(options, function (response) {
    response.on('data', function (chunk) {
      data += chunk;
    });
    response.on('end', function () {
      var results = JSON.parse(data).results.bindings

      Seq()
        .seq(function () {
          var _this = this

          //clear db with previous data
          app.App.remove(function () {
            _this()
          })
        })
        .set(results)
        .parEach(function (result) {
          var _this = this
          // build the object for db
          _.each(result, function (val, key) {
            result[key] = val.value
          })
          // put into db
          var item = new app.App( result )
          item.save(function (err) {
            _this(err)
          })
        })
        .seq(function () {
          res.json("success")
        })
    });
  }).on('error', function (e) {
    console.log("Got error: " + e.message);
    res.json(e.message)
  });

};

// builds a proper where clause for bag-of-words search
function buildConditions (query) {
  var conditions = {}

  if (query) {
    query = query.replace(/\W/g, " ") // replace all punctuation with spaces
    query = query.replace(/ {2,}/g," ") // then replace multiple spaces with a single one
    query = helper.strip(query)
    if (query.length > 1) {
      // regex: /(word1)|(word2)/i
      query = "(" + query.replace(/ /g, ")|(") + ")"

      conditions = { $or: [
        { title: new RegExp(query, "i") }
      , { description: new RegExp(query, "i") }
      ] }
    }
  }
  return conditions
}
// apps query and pagination
ExternalController.prototype.apps = function (req, res) {
  var app = req.app
    , params = req.query
    , offset = params.offset ? params.offset : 0
    , limit = params.limit ? params.limit : 10
    , query = params.query
    , conditions = buildConditions(query)

  // build output object and then give it to view
  var output = {};
  Seq()
    .seq(function getRecoms() {
      var self = this;

      app.App.find( conditions
                  , 'title source screenshot thumbnail description'
                  , {limit: limit, skip: offset}
                  , function (err, result) {
                    self(err, result)
                  })
    })
    .seq(function sendResponse(data) {
      // console.log(output);
      res.json(data)
    })
    .catch(function (err) {
      res.json(err)
    })

};

// bundles query and pagination
ExternalController.prototype.bundles = function (req, res) {
  var app = req.app
    , params = req.query
    , offset = params.offset ? params.offset : 0
    , limit = params.limit ? params.limit : 10
    , query = params.query
    , conditions = buildConditions(query)

  // build output object and then give it to view
  var output = {};
  Seq()
    .seq(function getRecoms() {
      var self = this;

      app.Bundle.find( conditions
                  , 'title screenshot thumbnail description apps'
                  , {limit: limit, skip: offset}
                  , function (err, result) {
                    self(err, result)
                  })
    })
    .seq(function sendResponse(data) {
      // console.log(output);
      res.json(data)
    })
    .catch(function (err) {
      res.json(err)
    })

}

// populates the db with bundles and bundles from widget store
// sparql endpoint: http://role-widgetstore.eu/simplerdf/sparql
// query is in bundles.sparql file
// as a source it provides graasp urls, and then graasp serves the OMDL file for the bundle
ExternalController.prototype.populate_bundles = function (req, res) {
  var app = req.app
    , bundles = []
    , screenshots = {}
    , apps = {}

  Seq()
    //clear db with previous data
    .par(function () {
      var _this = this
      app.Bundle.remove(function () { _this() })
    })
    // get bundles from widget store
    .par(function () {
      var _this = this
      var uri = '/simplerdf/sparql?query=prefix+dc%3A+<http%3A%2F%2Fpurl.org%2Fdc%2Fterms%2F>%0D%0Aprefix+role%3A+<http%3A%2F%2Fpurl.org%2Frole%2Fterms%2F>%0D%0Aprefix+foaf%3A+<http%3A%2F%2Fxmlns.com%2Ffoaf%2F0.1%2F>%0D%0Aselect+*%0D%0AWHERE+%7B%0D%0A%3Fbundle+a+role%3Abundle+.%0D%0A%3Fbundle+dc%3Atitle+%3Ftitle+.%0D%0AOPTIONAL+%7B%3Fbundle+dc%3Adescription+%3Fdescription+.%7D%0D%0AOPTIONAL+%7B%3Fbundle+foaf%3Adepiction+%3Fthumbnail+.%7D%0D%0A%7D%0D%0A&output=json'
      getData(uri, function (results) {
        _.each(results, function (result) {
          var item = resultToHash(result)
          bundles.push(item)
        })
        _this()
      })
    })
    // get screenshots for a bundle from widget store
    .par(function () {
      var _this = this
      var uri = '/simplerdf/sparql?query=prefix+role%3A+<http%3A%2F%2Fpurl.org%2Frole%2Fterms%2F>%0D%0Aprefix+foaf%3A+<http%3A%2F%2Fxmlns.com%2Ffoaf%2F0.1%2F>%0D%0Aselect+*%0D%0AWHERE+%7B%0D%0A%3Fbundle+a+role%3Abundle+.%0D%0A%3Fbundle+foaf%3Aimg+%3Fscreenshot+.%0D%0A%7D%0D%0A&output=json'
      getData(uri, function (results) {
        _.each(results, function (result) {
          var item = resultToHash(result)
            , uri = item.bundle
          if (screenshots[uri]) {
            screenshots[uri] = screenshots[uri] + "," + item.screenshot
          } else {
            screenshots[uri] = item.screenshot
          }

        })
        _this()
      })
    })
    // get apps for a bundle from widget store
    .par(function () {
      var _this = this
      var uri = '/simplerdf/sparql?query=prefix+dcterms%3A+<http%3A%2F%2Fpurl.org%2Fdc%2Fterms%2F>%0D%0Aprefix+role%3A+<http%3A%2F%2Fpurl.org%2Frole%2Fterms%2F>%0D%0A%0D%0ASELECT+%3Fbundle+%3Fsrc%0D%0AWHERE+%7B%0D%0A++%3Fbundle+rdf%3Atype+role%3Abundle+.%0D%0A++%3Fbundle+role%3AtoolConfiguration+%3Fconfiguration+.%0D%0A++%3Fconfiguration+role%3Atool+%3Ftool+.%0D%0A++%3Ftool+dcterms%3Asource+%3Fsrc+.%0D%0A%7D%0D%0A&output=json'
      getData(uri, function (results) {
        _.each(results, function (result) {
          var item = resultToHash(result)
            , uri = item.bundle
          if (apps[uri]) {
            apps[uri] = apps[uri] + "," + item.src
          } else {
            apps[uri] = item.src
          }

        })
        _this()
      })
    })
    // since a bundle can have several screenshots and several apps, we create and array of them
    // for each bundle
    .seq(function () {
      // process all the rows received from widget store
      var arr = []
      _.each(bundles, function (bundle) {
        var uri = bundle.bundle //get the uri from bundle object
        // add screenshot
        bundle.screenshot = screenshots[uri]

        // add apps
        bundle.apps = apps[uri]

        arr.push(bundle)
      })

      this(null, arr)
    })
    .flatten()
    .parEach(function (result) {
      var _this = this
      // put into db
      var item = new app.Bundle( result )
      item.save(function (err) {
        _this(err)
      })
    })
    .seq(function () {
      res.json("success")
    })
}

// gets data from the widgets store with URL = url and passed it to callback
// passes retrieved data to callback
function getData (url, cb) {
  var http = require("http")
    , data = ""

  var options =
    { host: 'role-widgetstore.eu'
    , port: 80
    , path: url
    }

  // get data from widget store
  http.get(options, function (response) {
    response.on('data', function (chunk) {
      data += chunk;
    });
    response.on('end', function () {
      var results = JSON.parse(data).results.bindings

      cb(results)
    })
  }).on('error', function (e) {
    console.log("Got error: " + e.message);
    res.json(e.message)
  })
}

// parses item from rdf request into object
// { uri: obj }
function resultToHash (result) {
  var item = {}

  // build one row obj
  _.each(result, function (val, key) {
    item[key] = val.value
  })

  return item
}
