var _ = require('underscore')._
  , Lingo = require('lingo')
  , client = new (require("mysql").Client)()
  ;

function objMethods(obj) {
  var newObj = {};
  for (p in obj) {
    if (obj.hasOwnProperty(p) && (typeof obj[p] === "function")) {
      newObj[p] = obj[p];
    }
  }

  return newObj;
}

var Helper = {}

module.exports = Helper

// One constructor inherites instance and class methods from the parent constructor
Helper.inherits = function inherits(Ctor, Parent) {
  var instanceMethods = objMethods(Parent.prototype);
  var classMethods = objMethods(Parent);

  _.extend(Ctor, classMethods); // to extend class methods of constructor
  _.extend(Ctor.prototype, instanceMethods); // to extend instance methods of constructor
};

// Create sequelize methods from Constructor function
Helper.toSequelizeMethods = function toSequelizeMethods(ctor) {
  return {classMethods: objMethods(ctor), instanceMethods: objMethods(ctor.prototype),
      underscore: true, timestamps: false};
};

// function randomString(len, charSet) {
//     charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//     var randomString = '';
//     for (var i = 0; i < len; i++) {
//         var randomPoz = Math.floor(Math.random() * charSet.length);
//         randomString += charSet.substring(randomPoz, randomPoz + 1);
//     }
//     return randomString;
// }

//
// ### function randomString (bits)
// #### @bits {integer} The number of bits for the random base64 string returned to contain
// randomString returns a pseude-random ASCII string which contains at least the specified number of bits of entropy
// the return value is a string of length (bits/6) of characters from the base64 alphabet
//
Helper.randomString = function randomString(bits) {
  var chars, rand, i, ret;

  chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
  ret = '';

  // in v8, Math.random() yields 32 pseudo-random bits (in spidermonkey it gives 53)
  while (bits > 0) {
    // 32-bit integer
    rand = Math.floor(Math.random() * 0x100000000);
    // base 64 means 6 bits per character, so we use the top 30 bits from rand to give 30/6=5 characters.
    for (i = 26; i > 0 && bits > 0; i -= 6, bits -= 6) {
      ret += chars[0x3F & rand >>> i];
    }
  }

  return ret;
};

/**
 * Encodes object to json and then to base64 string
 *
 * @param obj {JS object} javascript object
 * @returns {Base64 string} encoded string
 */
Helper.encodeJsonBase64 = function encodeJsonBase64(obj) {
  // decode to json
  var json = JSON.stringify(obj);
  // encode session object
  return new Buffer(json, 'utf8').toString('base64');
}

/**
 * Decodes base64 string into JS object
 *
 * @param string {Base64 string} Encoded string from database
 * @returns {JS object} Parsed human readable object
 */
Helper.decodeJsonBase64 = function decodeJsonBase64(str) {
  // encode session object
  var json = new Buffer(str, 'base64').toString('utf8');
  // parse json
  return JSON.parse(json);
}

/**
 * Camelizes the underscored sentense
 *
 * @param underscored {String} string to camelize
 * @param upcaseFirstLetter {Boolean} to upcase first letter or not
 * @returns {String} camelized string
 */
Helper.camelize = function (underscored, upcaseFirstLetter) {
    var res = '';
    underscored.split('_').forEach(function (part) {
        res += part[0].toUpperCase() + part.substr(1);
    });
    return upcaseFirstLetter ? res : res[0].toLowerCase() + res.substr(1);
};

/**
 * Converts date to SQL format
 *
 * @param date {Date} Date to convert
 * @returns {Date} converted date
 */
Helper.toSqlDate = function (date) {
 return [
   [
     date.getFullYear(),
     ((date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1)),
     ((date.getDate() < 10 ? '0' : '') + date.getDate())
   ].join("-"),
   date.toLocaleTimeString()
 ].join(" ")
};

/**
 * Converts date to SQL format and make hours, minutes, seconds zero
 *
 * @param date {Date} Date to convert
 * @returns {Date} converted date
 */
Helper.toSqlDateNoTime = function (date) {
 return [
   [
     date.getFullYear(),
     ((date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1)),
     ((date.getDate() < 10 ? '0' : '') + date.getDate())
   ].join("-"),
   "00:00:00"
 ].join(" ")
};

/**
 * Added from sequelize
 */
Helper.singularize = function (s) {
  return Lingo.en.isSingular(s) ? s : Lingo.en.singularize(s)
};
Helper.pluralize = function (s) {
  return Lingo.en.isPlural(s) ? s : Lingo.en.pluralize(s)
};
Helper.addTicks = function (s) {
  return '`' + Helper.removeTicks(s) + '`'
};
Helper.removeTicks = function (s) {
  return s.replace("`", "")
};
Helper.escape = function (s) {
  return client.escape(s)
};
Helper.isHash = function (obj) {
  return (typeof obj == 'object') && !obj.hasOwnProperty('length')
};
Helper.format = function (arr) {
  var query        = arr[0]
    , replacements = _.compact(arr.map(function (obj) { return obj != query ? obj : null}))

  return client.format.apply(client, [query, replacements])
};
Helper.argsArePrimaryKeys = function (args, primaryKeys) {
  var result = (args.length == _.keys(primaryKeys).length)
  _.each(args, function (arg) {
    if(result) {
      if(['number', 'string'].indexOf(typeof arg) > -1)
        result = true
      else
        result = (arg instanceof Date)
    }
  })
  return result
};

// parses the integer (seconds) to time format "1:30"
Helper.secondsToHourmin = function (time, empty) {
  var default_value = (empty) ? "" : "0:00"
  if (time === null || time === 0) return default_value;

  var h = Math.floor(time/3600);
  var value = time - h*3600;

  var m = Math.floor(value/60);
  if(m<10) m = "0" + m; else m = "" + m;

  var output = h + ":" + m;

  return output;
};

/**
 * Builds a web url for user, event, etc.
 *
 * @param {String} type people, races, etc.
 * @param {Number} id of an element
 * @returns {String} url
 */
Helper.webUrl = function (type, id) {
  // /people/10
  return "/" + type + "/" + id;
};


/**
 * Builds a url for item's picture
 *
 * @param {Object} item for which picture is requested
 * @param {String} size of wished image ("medium", "thumb")
 * @returns {String} url
 */
Helper.pictureUrl = function (item, size) {
  size = size || "thumb"
  if (!item) return ""

  var url = "/img/default/" + size + "_" + item.classOf + ".png"

  if (item.picture && item.id) {
    url = "/" + item.classOf + "/" + item.id + "/" + size + "_" + item.picture
  }

  return url
}

