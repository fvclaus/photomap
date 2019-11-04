// Mock gettext() function
// eslint-disable-next-line
function gettext (text) {
  return text
}

define(["./JQueryMatchers", "dojo/domReady!"], function (jQueryMatchers) {
  // Make matcher available to all specs
  beforeEach(function () {
    jasmine.addMatchers(jQueryMatchers)
  })

  return {
    load: function (id, require, callback) {
      var $testBody = $("#testBody")
      if (!$testBody.length) {
        if (!document.body) {
          document.body = document.createElement("body")
        }
        $testBody = $("<div id='testBody'></div>")
          .appendTo(document.body)
      }
      callback($testBody)
    }
  }
})
