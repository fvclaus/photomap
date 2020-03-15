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
            $container = TestEnv.append($container)
          } else {
            $container = this.createContainer()
          }
          this.widget = new Widget(params || {}, $container.get(0))
          this.$container = TestEnv.findContainer().attr("id", this.widget.viewName)
          this.domNode = this.$container.get(0)
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
          return TestEnv.findContainer()
        },

        destroyWidget: function () {
          this.widget.destroy()
        }
      })

      TestEnv.findContainer = function () {
        return $testBody.find(":first-child").first()
      }
      TestEnv.createCustomContainer = function (elements) {
        $testBody
          .empty()
          .append(elements)
        return TestEnv.findContainer()
      }
      // TODO Rename this
      TestEnv.append = function (html) {
        var $els = $(html)
        $testBody
          .append($els)
        return $els
      }

      var executeTestFn = function (testFn, done) {
        return function () {
          // We must release the subscription function
          // otherwise a new publish event could result in an infinte loop.
          setTimeout(function () {
            switch (testFn.length) {
              case 0:
                try {
                  testFn()
                } catch (e) {
                  console.error(e)
                  throw e
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
        }
      }

      var executeSetupFn = function (setupFn, additionalArgs) {
        try {
          setupFn.apply(null, additionalArgs)
        } catch (e) {
          console.error("Error while preparing it " + e)
          throw e
        }
      }

      TestEnv.wrapJasmineItAsyncSetup = function (registerAsyncFn, setupFn) {
        return function (name, testFn) {
          var args = Array.prototype.slice.call(arguments)
          it(name, function (done) {
            registerAsyncFn(executeTestFn(testFn, done))
            executeSetupFn(setupFn, args.slice(2))
          })
        }
      }

      TestEnv.wrapJasmineItSyncSetup = function (setupFn) {
        return function (name, testFn) {
          it(name, function (done) {
            executeSetupFn(setupFn)
            executeTestFn(testFn, done)()
          })
        }
      }

      TestEnv.waitForPublishEvent = function (eventName, triggerPublishFn) {
        return TestEnv.wrapJasmineItAsyncSetup(function (testFnWrapper) {
          return communicator.subscribeOnce(eventName, testFnWrapper)
        }, triggerPublishFn)
      }

      callback(TestEnv)
    }
  }
})
