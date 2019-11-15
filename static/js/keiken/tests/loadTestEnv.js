define(["./JQueryMatchers",
  "node_modules/jasmine-jquery-matchers/dist/jasmine-jquery-matchers",
  "dojo/domReady!"], function (jQueryMatchers, jasmineJqueryMatchers) {
  // Make matcher available to all specs
  beforeEach(function () {
    jasmine.addMatchers(jQueryMatchers)
    jasmine.addMatchers(jasmineJqueryMatchers)
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
