define(["dojo/_base/declare",
  "../util/Communicator",
  "./JQueryMatchers",
  "node_modules/jasmine-jquery-matchers/dist/jasmine-jquery-matchers",
  "dojo/domReady!"], function (declare, communicator, jQueryMatchers, jasmineJqueryMatchers) {
  // Make matcher available to all specs
  beforeEach(function () {
    jasmine.addMatchers(jQueryMatchers)
    jasmine.addMatchers(jasmineJqueryMatchers)
  })

  return {
    // eslint-disable-next-line no-unused-vars
    load: function (id, require, callback) {
      var $testBody = $("#testBody")
      if (!$testBody.length) {
        if (!document.body) {
          document.body = document.createElement("body")
        }
        $testBody = $("<div id='testBody'></div>")
          .appendTo(document.body)
      }
      var TestEnv = declare(null, {
        createWidget: function (params, Widget, $container) {
          if ($container) {
            $container = this.append($container)
          } else {
            $container = this.createContainer()
          }
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
      })

      TestEnv.wrapJasmineIt = function (eventFn, triggerFn) {
        return function (name, testFn) {
          it(name, function (done) {
            eventFn(function () {
              // We must release the subscription function
              // otherwise a new publish event could result in an infinte loop.
              setTimeout(function () {
                switch (testFn.length) {
                  case 0:
                    try {
                      testFn()
                    } catch (e) {
                      console.error(e)
                    } finally {
                      done()
                    }
                    break
                  case 1:
                    testFn(done)
                    break
                  default:
                    console.error(name, "testFn has too many arguments")
                }
              })
            })
            triggerFn()
          })
        }
      }

      TestEnv.waitForPublishEvent = function (eventName, triggerPublishFn) {
        return TestEnv.wrapJasmineIt(function (testFnWrapper) {
          return communicator.subscribeOnce(eventName, testFnWrapper)
        }, triggerPublishFn)
      }

      callback(TestEnv)
    }
  }
})
