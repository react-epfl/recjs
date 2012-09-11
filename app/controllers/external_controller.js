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

  http.get(options, function (response) {
    response.on('data', function (chunk) {
      data += chunk;
    });
    response.on('end', function () {
			var results = JSON.parse(data).results.bindings

			Seq()
				.seq(function () {
					//clear db with previous data
					app.App.destroyAll({}, this)
				})
				.set(results)
				.parEach(function (result) {
					var _this = this
					// build the object for db
					_.each(result, function (val, key) {
						result[key] = val.value
					})
					// put into db
					app.App.create(result, function (err) {
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
function buildWhereClause (query) {
  var where = ""

  if (query) {
    query = query.replace(/\W/g, " ") // replace all punctuation with spaces
    query = query.replace(/ {2,}/g," ") // then replace multiple spaces with a single one
    query = helper.strip(query)
    query = "'(" + query.replace(/ /g, "|") + ")'"
    where = "title REGEXP " + query + " OR description REGEXP " + query
  }
  return where
}
// apps query and pagination
ExternalController.prototype.apps = function (req, res) {
  var app = req.app
		, params = req.query
    , offset = params.offset ? params.offset : 0
		, limit = params.limit ? params.limit : 10
    , query = params.query
    , where = buildWhereClause(query)

  // build output object and then give it to view
  var output = {};
  Seq()
    .seq(function getRecoms() {
      var self = this;

      app.App.findAll({offset: offset, limit: limit, where: where}, function (err, result) {
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
    , where = buildWhereClause(query)

  // build output object and then give it to view
  var output = {};
  Seq()
    .seq(function getRecoms() {
      var self = this;

      app.Bundle.findAll({offset: offset, limit: limit, where: where}, function (err, result) {
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
// populates the db with bundles and bundles from widget store
// sparql endpoint: http://role-widgetstore.eu/simplerdf/sparql
// query is in bundles.sparql file
ExternalController.prototype.populate_bundles = function (req, res) {
  var app = req.app

  var http = require("http")
    , data = ""

  var options =
		{ host: 'role-widgetstore.eu'
		, port: 80
		, path: '/simplerdf/sparql?query=prefix+dc%3A+<http%3A%2F%2Fpurl.org%2Fdc%2Fterms%2F>%0D%0Aprefix+role%3A+<http%3A%2F%2Fpurl.org%2Frole%2Fterms%2F>%0D%0Aprefix+foaf%3A+<http%3A%2F%2Fxmlns.com%2Ffoaf%2F0.1%2F>%0D%0ASELECT+%3Ftitle+%3Fsource+%3Fdescription+%3Fthumbnail+%3Fscreenshot%0D%0A%7B%0D%0A%3Ftool+a+role%3AOpenSocialGadget+.%0D%0AOPTIONAL+%7B%3Ftool+dc%3Atitle+%3Ftitle+.%7D%0D%0AOPTIONAL+%7B%3Ftool+dc%3Asource+%3Fsource+.%7D%0D%0AOPTIONAL+%7B%3Ftool+dc%3Adescription+%3Fdescription+.%7D%0D%0AOPTIONAL+%7B%3Ftool+foaf%3Aimg+%3Fscreenshot+.%7D%0D%0AOPTIONAL+%7B%3Ftool+foaf%3Adepiction+%3Fthumbnail+.%7D%0D%0A%0D%0A%7D%0D%0A&output=json'
  	}

		//TODO: enable once support exists in ROLE
  //http.get(options, function (response) {
    //response.on('data', function (chunk) {
      //data += chunk;
    //});
    //response.on('end', function () {
			//var results = JSON.parse(data).results.bindings

			//Seq()
				//.seq(function () {
					////clear db with previous data
					//app.App.destroyAll({}, this)
				//})
				//.set(results)
				//.parEach(function (result) {
					//var _this = this
					//// build the object for db
					//_.each(result, function (val, key) {
						//result[key] = val.value
					//})
					//// put into db
					//app.App.create(result, function (err) {
						//_this(err)
					//})
				//})
				//.seq(function () {
					//res.json("success")
				//})
    //});
  //}).on('error', function (e) {
    //console.log("Got error: " + e.message);
		//res.json(e.message)
  //});
	
	
	var db = [ { "description": "Learn a foreign language by reading text of your choice on the Web with the Language Resource Browser widget. Select words you do not know and send them to the Translator widget to see translations in your own language. Collect the words most important to you and train them in the Vocabulary Trainer widget. It will present words and ask you to translate them, helping you to focus on those hard to remember.", "screenshot": "http://www.role-widgetstore.eu/sites/default/files/imagecache/bundle_400x400/images/screenshots/2012-03-22%2015%2038%2011.png", "thumbnail": "http://www.role-widgetstore.eu/sites/default/files/imagecache/thumbnail/images/thumbnails/2012-03-22%2015%2038%2011.png", "title": "LEARN A FOREIGN LANGUAGE BY READING TEXT", "source": "http://iamac71.epfl.ch/omdl.xml" }, { "description": "This widget bundle supports user in searching for learning content related to an interesting subject and organizing it in a personal learning environment, for example in iGoogle. To use the widget bundle one has to create an account by personal learning environment or by learning management system, add the widget bundle and create a login or user for the widgets included. This widget bundle consists of two widgets: Media Search Widget and Media List Widget, which serve to find learning content and to organize it in media lists. Tagging, sharing and commenting functionalities as well as collaborative creating of media lists are planned.", "screenshot": "http://www.role-widgetstore.eu/sites/default/files/imagecache/bundle_400x400/images/screenshots/2012-03-22%2016%2004%2026_0.png", "thumbnail": "http://www.role-widgetstore.eu/sites/default/files/imagecache/thumbnail/images/thumbnails/2012-03-22%2016%2004%2026.png", "title": "SEARCH AND ORGANIZE MEDIA", "source": "http://iamac71.epfl.ch/omdl.xml" }, { "description": "Creating an audio self-presentation in French widget bundle includes four main widgets: a translator widget, a spell checker, a text-to speech engine and a recording widget, and some additional tools such as a CAM widget, a business dictionary and a conjugation tool. The four main widgets are used to create a self-presentation in French language, the additional widgets are to assist student in his learning activities and to collect usage data. This widget bundle is helpful in a language learning context and can be used to complete different tasks, such as learning vocabulary, improvement of pronunciation, producing of texts and audio-files, etc.", "screenshot": "http://www.role-widgetstore.eu/sites/default/files/imagecache/bundle_400x400/images/screenshots/Figure%201_0.png", "thumbnail": "http://www.role-widgetstore.eu/sites/default/files/imagecache/thumbnail/images/thumbnails/Figure%204_0.png", "title": "CREATING AN AUDIO SELF-PRESENTATION IN FRENCH", "source": "http://iamac71.epfl.ch/omdl.xml" }, { "description": "The bundle for creating a learning plan using activity recommendations consists of “Activity Recommender” and “To-Learn list” widgets. The bundle guides the learner through the learning process by recommending learning activities and provides support for compiling a learning plan.", "screenshot": "http://www.role-widgetstore.eu/sites/default/files/imagecache/bundle_400x400/images/screenshots/artl.gif", "thumbnail": "http://www.role-widgetstore.eu/sites/default/files/imagecache/thumbnail/images/thumbnails/artl.gif", "title": "CREATING A LEARNING PLAN USING ACTIVITY RECOMMENDATIONS", "source": "http://iamac71.epfl.ch/omdl.xml" }, { "description": "This bundle consists of two widgets. The first one can be used for goal setting and self-evaluation regarding aquired competences. The other one gives an overview of the defined goals and competences. Both require and Open App context (ROLE SDK or ROLE Sandbox). These widgets are technical demonstrators.", "screenshot": "http://www.role-widgetstore.eu/sites/default/files/imagecache/bundle_400x400/images/screenshots/share-you-experience-bundle-widget.png", "thumbnail": "http://www.role-widgetstore.eu/sites/default/files/imagecache/thumbnail/images/thumbnails/share-you-experience-bundle-thumbnail.png", "title": "SHARE YOUR EXPERIENCE", "source": "http://iamac71.epfl.ch/omdl.xml" }, { "description": "The bundle contains two widgets, one generic event reciever and one widget from where a range of different events can be sent out.", "screenshot": "http://www.role-widgetstore.eu/sites/default/files/imagecache/thumbnail/images/thumbnails/OALogo.png", "thumbnail": "http://www.role-widgetstore.eu/sites/default/files/imagecache/thumbnail/images/thumbnails/OALogo.png", "title": "TESTING EVENTS COMMUNICATION", "source": "http://iamac71.epfl.ch/omdl.xml" } ]
	Seq()
		.seq(function () {
			//clear db with previous data
			app.Bundle.destroyAll({}, this)
		})
		.set(db)
		.parEach(function (result) {
			var _this = this
			// put into db
			app.Bundle.create(result, function (err) {
				_this(err)
			})
		})
		.seq(function () {
			res.json("success")
		})
};
