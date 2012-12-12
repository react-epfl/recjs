#!/usr/bin/env node

var mongoose = require('mongoose');
var db = mongoose.createConnection('localhost', 'test');

var schema = mongoose.Schema({ name: 'string' });
var Cat = db.model('Cat', schema);

//var kitty = new Cat({ name: 'Zildjian' });
//kitty.save(function (err) {
  //if (err) // ...
  //console.log('meow');

//});


Cat.find({name: 'Zildjian'}, function (err, cat) {

  console.log(cat)

  mongoose.disconnect()
})

