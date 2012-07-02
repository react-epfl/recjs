var should = require('should')
  , helper = require("../test_helper")({table: "sport"})
  , gently = new (require('gently'))

module.exports = {
  'test Sport.userSports when user is not specified': function () {
    var app = {UserSport: {}}
      , Sport = helper.addModel(app)
      , user = null
      , dbSportTree = [
          {id: 1, name: "run", kind: "endurance"}
        , {id: 2, name: "ski", kind: "endurance", children: [
            {id: 3, name: "classic", kind: "endurance"}
          , {id: 4, name: "skating", kind: "other"}
          ]
          }
        ]
      , dbUserSports = [1,2,3,4]

    gently.expect(Sport, "allSportTree", function (fn) {
      fn(null, dbSportTree)
    })
    gently.expect(Sport, "allSportIds", function (fn) {
      fn(null, dbUserSports)
    })
    var cb = gently.expect(function (err, sports) {
      var s = sports[0]
      s.id.should.equal(1)
      s.visible.should.equal(true)
      s.name.should.equal("run")
      s.kind.should.equal("endurance")
      should.not.exist(s.filter_selected)
      should.not.exist(s.anaerobic_threshold)
      should.not.exist(s.aerobic_threshold)

      var sub = sports[1].children[0]
      sub.id.should.equal(3)
      sub.visible.should.equal(true)
      sub.name.should.equal("classic")
      sub.kind.should.equal("endurance")
      should.not.exist(sub.filter_selected)
      should.not.exist(sub.anaerobic_threshold)
      should.not.exist(sub.aerobic_threshold)
    })
    Sport.userSports(user, cb)
  }
, 'test Sport.userSports when user is specified': function () {
    var app = {UserSport: {}}
      , Sport = helper.addModel(app)
      , user = {id: 1}
      , dbSportTree = [
          {id: 1, name: "run", kind: "endurance"}
        , {id: 2, name: "ski", kind: "endurance", children: [
            {id: 3, name: "classic", kind: "endurance"}
          , {id: 4, name: "skating", kind: "other"}
          ]}
        , {id: 5, name: "tennis", kind: "other"}
        ]
      , dbUserSports = [
          {id: 5, sport_id: 1, anaerobic_threshold: 140, aerobic_threshold: 120, filter_selected: true}
        , {id: 6, sport_id: 2, anaerobic_threshold: 150, aerobic_threshold: 130, filter_selected: false}
        , {id: 7, sport_id: 3, filter_selected: true}
        ]

    gently.expect(Sport, "allSportTree", function (fn) {
      fn(null, dbSportTree)
    })
    gently.expect(app.UserSport, "findAll", function (obj, fn) {
      obj.where.user_id.should.equal(user.id)
      fn(null, dbUserSports)
    })
    var cb = gently.expect(function (err, sports) {
      var s = sports[0]
      s.id.should.equal(1)
      s.visible.should.equal(true)
      s.name.should.equal("run")
      s.kind.should.equal("endurance")
      s.filter_selected.should.equal(true)
      s.anaerobic_threshold.should.equal(140)
      s.aerobic_threshold.should.equal(120)

      s = sports[2]
      s.id.should.equal(5)
      should.not.exist(s.visible)
      s.name.should.equal("tennis")
      s.kind.should.equal("other")
      should.not.exist(s.filter_selected)
      should.not.exist(s.anaerobic_threshold)
      should.not.exist(s.aerobic_threshold)

      var sub = sports[1].children[0]
      sub.id.should.equal(3)
      sub.visible.should.equal(true)
      sub.name.should.equal("classic")
      sub.kind.should.equal("endurance")
      sub.filter_selected.should.equal(true)
      sub.anaerobic_threshold.should.equal(150)
      sub.aerobic_threshold.should.equal(130)

      sub = sports[1].children[1]
      sub.id.should.equal(4)
      should.not.exist(s.visible)
      sub.name.should.equal("skating")
      sub.kind.should.equal("other")
      should.not.exist(sub.filter_selected)
      sub.anaerobic_threshold.should.equal(150)
      sub.aerobic_threshold.should.equal(130)
    })
    Sport.userSports(user, cb)
  }
, 'test Sport.allSportTree': function () {
    var app = {}
      , Sport = helper.addModel(app)
      , user = {}
      , db = [{id: 4, sport: "run"}
        , {id: 2, sport: "ski"}
        , {id: 3, parent_id: 2, sport: "classic"}
      ]

    gently.expect(Sport, "findAll", function (obj, fn) {
      fn(null, db)
    })

    var fn = gently.expect(function (err, tree) {
      tree.length.should.equal(2)
      tree[0].sport.should.equal("ski")
      tree[0].children.length.should.equal(1)
      tree[0].children[0].sport.should.equal("classic")
      tree[1].sport.should.equal("run")
    })
    Sport.allSportTree(fn)
  }
, 'test Sport.allSportHash': function () {
    var app = {}
      , Sport = helper.addModel(app)
      , user = {}

    gently.expect(Sport, "findAll", function (obj, fn) {
      fn(null, [{id: 1, sport: "run"}, {id: 2, sport: "ski"}])
    })

    var fn = gently.expect(function (err, hash) {
      hash["1"].sport.should.equal("run")
      hash["2"].sport.should.equal("ski")
    })
    Sport.allSportHash(fn)
  }
, 'test Sport.allSportHash': function () {
    var app = {}
      , Sport = helper.addModel(app)
      , user = {}

    gently.expect(Sport, "findAll", function (obj, fn) {
      fn(null, [{id: 1, sport: "run"}, {id: 2, sport: "ski"}])
    })

    var fn = gently.expect(function (err, hash) {
      hash["1"].sport.should.equal("run")
      hash["2"].sport.should.equal("ski")
    })
    Sport.allSportHash(fn)
  }
, 'test Sport.allSportIds': function () {
    var app = {}
      , Sport = helper.addModel(app)
      , user = {}

    gently.expect(Sport, "findAll", function (obj, fn) {
      fn(null, [{id: 3}, {id: 4}])
    })

    var fn = gently.expect(function (err, ids) {
      ids[0].should.equal(3)
      ids[1].should.equal(4)
    })
    Sport.allSportIds(fn)
  }
}
