
/**
 * Module dependencies.
 */

var express = require('express')
  , util = require('util')
  , MysqlDriver = require("./lib/mysql_driver")
  , mysql
  , os = require('os')
  , config = require('./lib/config')
  , db_config = config.getDbConfig()
  , connectRails = require('./lib/connect-rails')
  , helper = require('./lib/helper')
  , io = require('socket.io')
  , fs = require('fs')
  , host = "127.0.0.1"
  , db_logging
  , parseCookie = require('connect').utils.parseCookie

var app = module.exports = express.createServer()

// Setup mysql connection
app.configure('development', function () {
  db_config = db_config.development
  db_logging = true

  app.set('server_url', "http://localhost:8000")

  app.use(express.static(__dirname + '/public', { maxAge: 0}));
  //app.use(require('browserify')({require:__dirname + '/public/js/dash_app.js', mount: "/dash.js"}))
  app.use(express.errorHandler({dumpExceptions: true, showStack: true }))

});

app.configure('production', function () {
  // generate pid file
  fs.writeFile( '/home/vohtaski/public_html/sportaxy.com/shared/pids/node.pid'
              , process.pid + "\n"
              , function (err) {
                  if (err) throw err;
                }
              )

  host = "173.203.210.210";

  db_config = db_config.production;
  db_logging = false;

  app.set('server_email', "Sportaxy <info@sportaxy.com>")
  app.set('server_url', "http://sportaxy.com")

  var oneYear = 31557600000;
  app.use(express.static(__dirname + '/public', { maxAge: oneYear }));
  app.use(express.errorHandler());
});

app.configure('test', function () {
  db_config = db_config.test;
  db_logging = true;

  app.set('server_email', "Sportaxy Test <test@sportaxy.com>")
  app.set('server_url', "http://localhost:8000")

  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
})

// 'sportaxy_development', 'root', null
mysql = new MysqlDriver( db_config.database
                       , db_config.username
                       , db_config.password
                       , {logging: db_logging}
                       )

app.db = mysql;

// mysql.user = app.settings.db_config.username;
// mysql.password = app.settings.db_config.password;
//
// mysql.connect();
// mysql.query('USE ' + app.settings.db_config.database);

// app.set('mysql', mysql);

// Configuration
app.configure(function () {
  // Bind views
  app.set('views', __dirname + '/app/views');
  // app.set('view engine', 'ejs');
  app.set('view engine', 'jade');

  // uploads files by default into /tmp folder
  app.use(express.bodyParser({keepExtensions: true, uploadDir: __dirname + "/tmp"}))
  //app.use(express.bodyParser())
  app.use(express.methodOverride());
  app.use(express.cookieParser());

  // adds database to request
  app.use(connectRails.database(mysql));

  // app.use(express.session({ secret: 'secret here' }));
  app.use(app.router);
});


// add special classes to application namespace
app.helper = helper;

// app.configure(function () {
//   app.use(rails.session)
//   app.use(rails.mysql)
// })


// Boot all models
// var models = require(__dirname + "/app/models/user");
// models.init(mysql);

// Bootstrap routes and controllers
// routes are included inside controllers
var boot = require(__dirname + '/config/boot');
global.mysql = mysql;
boot.start(app);

app.listen(9000, host, function () {
  console.log( "Express server listening on port %d in %s mode"
             , app.address().port
             , app.settings.env
             )
});

