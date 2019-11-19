define(["dojo/_base/declare",
  "./JQueryMatchers",
  "node_modules/jasmine-jquery-matchers/dist/jasmine-jquery-matchers",
  "dojo/domReady!"], function (declare, jQueryMatchers, jasmineJqueryMatchers) {
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
      // eslint-disable-next-line standard/no-callback-literal
      callback(declare(null, {
        createWidget: function (params, Widget) {
          var $container = this.createContainer()
          this.widget = new Widget(params, $container.get(0))
          this.$container = this.findContainer().attr("id", this.widget.viewName)
          return this
        },
        createContainer: function (id) {
          var $container = $("<div/>")
          // Avoid creating temporary ids (dijit widgets are indexed by id)
          if (id) {
            $container.attr("id", id)
          }
          $testBody
            .empty()
            .append($container)
          return this.findContainer()
        },
        findContainer: function () {
          return $testBody.find(":first-child")
        },
        append: function (elements) {
          $testBody
            .empty()
            .append(elements)
          return this.findContainer()
        },
        destroyWidget: function () {
          this.widget.destroy()
        }
      }))
    }
  }
})
