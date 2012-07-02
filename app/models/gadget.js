/**
 * Gadget model
 */
function Gadget() {

}
module.exports = Gadget

Gadget.method1 = function() {
  var app = this.app()

  return 'smth'
}

Gadget.prototype.method2 = function() {
  var app = this.app()
  return 'foo'
}

