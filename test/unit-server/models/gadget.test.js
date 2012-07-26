var helper = require("test_helper")
  , gently = new (require('gently'))
  , should = require('should')

function defaultModel(app) {
  return helper.model(app, "gadget")
}

describe('gadget', function () {
  it('should Gadget.userGadgets when user is not specified', function () {
    var app = {UserGadget: {}}
      , Gadget = defaultModel(app)
      , user = null
      , dbGadgetTree = [
          {id: 1, name: "run", kind: "endurance"}
        , {id: 2, name: "ski", kind: "endurance", children: [
            {id: 3, name: "classic", kind: "endurance"}
          , {id: 4, name: "skating", kind: "other"}
          ]
          }
        ]
      , dbUserGadgets = [1,2,3,4]

    gently.expect(Gadget, "allGadgetTree", function (fn) {
      fn(null, dbGadgetTree)
    })
    gently.expect(Gadget, "allGadgetIds", function (fn) {
      fn(null, dbUserGadgets)
    })
    var cb = gently.expect(function (err, gadgets) {
      var s = gadgets[0]
      s.id.should.equal(1)
      s.visible.should.equal(true)
      s.name.should.equal("run")
      s.kind.should.equal("endurance")
      should.not.exist(s.filter_selected)
      should.not.exist(s.anaerobic_threshold)
      should.not.exist(s.aerobic_threshold)

      var sub = gadgets[1].children[0]
      sub.id.should.equal(3)
      sub.visible.should.equal(true)
      sub.name.should.equal("classic")
      sub.kind.should.equal("endurance")
      should.not.exist(sub.filter_selected)
      should.not.exist(sub.anaerobic_threshold)
      should.not.exist(sub.aerobic_threshold)
    })
    Gadget.userGadgets(user, cb)
  })
  it('should Gadget.userGadgets when user is specified', function () {
    var app = {UserGadget: {}}
      , Gadget = defaultModel(app)
      , user = {id: 1}
      , dbGadgetTree = [
          {id: 1, name: "run", kind: "endurance"}
        , {id: 2, name: "ski", kind: "endurance", children: [
            {id: 3, name: "classic", kind: "endurance"}
          , {id: 4, name: "skating", kind: "other"}
          ]}
        , {id: 5, name: "tennis", kind: "other"}
        ]
      , dbUserGadgets = [
          {id: 5, gadget_id: 1, anaerobic_threshold: 140, aerobic_threshold: 120, filter_selected: true}
        , {id: 6, gadget_id: 2, anaerobic_threshold: 150, aerobic_threshold: 130, filter_selected: false}
        , {id: 7, gadget_id: 3, filter_selected: true}
        ]

    gently.expect(Gadget, "allGadgetTree", function (fn) {
      fn(null, dbGadgetTree)
    })
    gently.expect(app.UserGadget, "findAll", function (obj, fn) {
      obj.where.user_id.should.equal(user.id)
      fn(null, dbUserGadgets)
    })
    var cb = gently.expect(function (err, gadgets) {
      var s = gadgets[0]
      s.id.should.equal(1)
      s.visible.should.equal(true)
      s.name.should.equal("run")
      s.kind.should.equal("endurance")
      s.filter_selected.should.equal(true)
      s.anaerobic_threshold.should.equal(140)
      s.aerobic_threshold.should.equal(120)

      s = gadgets[2]
      s.id.should.equal(5)
      should.not.exist(s.visible)
      s.name.should.equal("tennis")
      s.kind.should.equal("other")
      should.not.exist(s.filter_selected)
      should.not.exist(s.anaerobic_threshold)
      should.not.exist(s.aerobic_threshold)

      var sub = gadgets[1].children[0]
      sub.id.should.equal(3)
      sub.visible.should.equal(true)
      sub.name.should.equal("classic")
      sub.kind.should.equal("endurance")
      sub.filter_selected.should.equal(true)
      sub.anaerobic_threshold.should.equal(150)
      sub.aerobic_threshold.should.equal(130)

      sub = gadgets[1].children[1]
      sub.id.should.equal(4)
      should.not.exist(s.visible)
      sub.name.should.equal("skating")
      sub.kind.should.equal("other")
      should.not.exist(sub.filter_selected)
      sub.anaerobic_threshold.should.equal(150)
      sub.aerobic_threshold.should.equal(130)
    })
    Gadget.userGadgets(user, cb)
  })
  it('should Gadget.allGadgetTree', function () {
    var app = {}
      , Gadget = defaultModel(app)
      , user = {}
      , db = [{id: 4, gadget: "run"}
        , {id: 2, gadget: "ski"}
        , {id: 3, parent_id: 2, gadget: "classic"}
      ]

    gently.expect(Gadget, "findAll", function (obj, fn) {
      fn(null, db)
    })

    var fn = gently.expect(function (err, tree) {
      tree.length.should.equal(2)
      tree[0].gadget.should.equal("ski")
      tree[0].children.length.should.equal(1)
      tree[0].children[0].gadget.should.equal("classic")
      tree[1].gadget.should.equal("run")
    })
    Gadget.allGadgetTree(fn)
  })
  it('should Gadget.allGadgetHash', function () {
    var app = {}
      , Gadget = defaultModel(app)
      , user = {}

    gently.expect(Gadget, "findAll", function (obj, fn) {
      fn(null, [{id: 1, gadget: "run"}, {id: 2, gadget: "ski"}])
    })

    var fn = gently.expect(function (err, hash) {
      hash["1"].gadget.should.equal("run")
      hash["2"].gadget.should.equal("ski")
    })
    Gadget.allGadgetHash(fn)
  })
  it('should Gadget.allGadgetHash', function () {
    var app = {}
      , Gadget = defaultModel(app)
      , user = {}

    gently.expect(Gadget, "findAll", function (obj, fn) {
      fn(null, [{id: 1, gadget: "run"}, {id: 2, gadget: "ski"}])
    })

    var fn = gently.expect(function (err, hash) {
      hash["1"].gadget.should.equal("run")
      hash["2"].gadget.should.equal("ski")
    })
    Gadget.allGadgetHash(fn)
  })
  it('should Gadget.allGadgetIds', function () {
    var app = {}
      , Gadget = defaultModel(app)
      , user = {}

    gently.expect(Gadget, "findAll", function (obj, fn) {
      fn(null, [{id: 3}, {id: 4}])
    })

    var fn = gently.expect(function (err, ids) {
      ids[0].should.equal(3)
      ids[1].should.equal(4)
    })
    Gadget.allGadgetIds(fn)
  })
})

