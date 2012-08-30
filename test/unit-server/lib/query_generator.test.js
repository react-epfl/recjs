var helper = require("test_helper")
  , gently = new (require('gently'))
  , should = require('should')
  , assert = require("assert")
  , QueryGenerator = helper.require("/lib/query_generator")
  , eql = assert.equal

describe('query_generator', function () {
  it('should create table query', function () {
    eql(QueryGenerator.createTableQuery('myTable', {title: 'VARCHAR(255)', name: 'VARCHAR(255)'}), "CREATE TABLE IF NOT EXISTS `myTable` (`title` VARCHAR(255),`name` VARCHAR(255));")
  })
  it('should drop table query', function () {
    eql(QueryGenerator.dropTableQuery('myTable'), "DROP TABLE IF EXISTS `myTable`;")
  })
  it('should select query #default', function () {
    eql(QueryGenerator.selectQuery('myTable'), "SELECT * FROM `myTable`;")
  })
  it('should select query #attributes', function () {
    eql(QueryGenerator.selectQuery('myTable', {attributes: ['id', 'name']}), "SELECT `id`,`name` FROM `myTable`;")
  })
  it('should select query #where', function () {
    eql(QueryGenerator.selectQuery('myTable', {where: {id: 2}}), "SELECT * FROM `myTable` WHERE `id`=2;")
    eql(QueryGenerator.selectQuery('myTable', {where: {name: 'foo'}}), "SELECT * FROM `myTable` WHERE `name`='foo';")
    eql(QueryGenerator.selectQuery('myTable', {where: {name: "foo';DROP TABLE myTable;"}}), "SELECT * FROM `myTable` WHERE `name`='foo\\';DROP TABLE myTable;';")
    eql(QueryGenerator.selectQuery('myTable', {where: 2}), "SELECT * FROM `myTable` WHERE `id`=2;")
    eql(QueryGenerator.selectQuery('myTable', {where: "foo='bar'"}), "SELECT * FROM `myTable` WHERE foo='bar';")
  })
  it('should select query #order', function () {
    eql(QueryGenerator.selectQuery('myTable', {order: "id DESC"}), "SELECT * FROM `myTable` ORDER BY id DESC;")
  })
  it('should select query #group', function () {
    eql(QueryGenerator.selectQuery('myTable', {group: "name"}), "SELECT * FROM `myTable` GROUP BY `name`;")
  })
  it('should select query #limit', function () {
    eql(QueryGenerator.selectQuery('myTable', {limit: 10}), "SELECT * FROM `myTable` LIMIT 10;")
  })
  it('should select query #offset', function () {
    eql(QueryGenerator.selectQuery('myTable', {limit: 10, offset: 2}), "SELECT * FROM `myTable` LIMIT 2, 10;")
    eql(QueryGenerator.selectQuery('myTable', {offset: 2}), "SELECT * FROM `myTable`;")
  })
  it('should insert query', function () {
    eql(QueryGenerator.insertQuery('myTable', {name: 'foo'}), "INSERT INTO `myTable` (`name`) VALUES ('foo');")
    eql(QueryGenerator.insertQuery('myTable', {name: "foo';DROP TABLE myTable;"}), "INSERT INTO `myTable` (`name`) VALUES ('foo\\';DROP TABLE myTable;');")
    eql(QueryGenerator.insertQuery('myTable', {name: 'foo', birthday: new Date(2011, 2, 27, 10, 1, 55)}), "INSERT INTO `myTable` (`name`,`birthday`) VALUES ('foo','2011-03-27 10:01:55');")
    eql(QueryGenerator.insertQuery('myTable', {name: 'foo', foo: 1}), "INSERT INTO `myTable` (`name`,`foo`) VALUES ('foo',1);")
  })
  it('should update query', function () {
    eql(
      QueryGenerator.updateQuery('myTable', {name: 'foo', birthday: new Date(2011, 2, 27, 10, 1, 55)}, {id: 2}),
      "UPDATE `myTable` SET `name`='foo',`birthday`='2011-03-27 10:01:55' WHERE `id`=2"
    )
    eql(
      QueryGenerator.updateQuery('myTable', {name: 'foo', birthday: new Date(2011, 2, 27, 10, 1, 55)}, 2),
      "UPDATE `myTable` SET `name`='foo',`birthday`='2011-03-27 10:01:55' WHERE `id`=2"
    )
    eql(QueryGenerator.updateQuery('myTable', {bar: 2}, {name: 'foo'}), "UPDATE `myTable` SET `bar`=2 WHERE `name`='foo'")
    eql(QueryGenerator.updateQuery('myTable', {name: "foo';DROP TABLE myTable;"}, {name: 'foo'}), "UPDATE `myTable` SET `name`='foo\\';DROP TABLE myTable;' WHERE `name`='foo'")
  })
  it('should deleteQuery', function () {
    eql(QueryGenerator.deleteQuery('myTable', {name: 'foo'}), "DELETE FROM `myTable` WHERE `name`='foo';")
    eql(QueryGenerator.deleteQuery('myTable', 1), "DELETE FROM `myTable` WHERE `id`=1;")
    eql(QueryGenerator.deleteQuery('myTable', 1, {limit: 10}), "DELETE FROM `myTable` WHERE `id`=1 LIMIT 10;")
    eql(QueryGenerator.deleteQuery('myTable', {name: "foo';DROP TABLE myTable;"}, {limit: 10}), "DELETE FROM `myTable` WHERE `name`='foo\\';DROP TABLE myTable;' LIMIT 10;")
  })
})

