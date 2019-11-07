"use strict"

define([],
  function () {
    function assertJqueryElement (element) {
      if (!(element instanceof $)) {
        throw new Error("Element " + element + " is not a jquery element.")
      }
    }

    function jQueryElementToString (element) {
      assertObject(element)
      return element[0] ? element[0].outerHTML : "[empty]"
    }

    var VARIABLE_REGEX = /(\{\{.*\}\})/

    function interpolateMessage (message, variables) {
      var fragments = message.split(VARIABLE_REGEX)
      var interpolatedMessage = ""

      fragments.forEach(function (fragment) {
        if (VARIABLE_REGEX.test(fragment)) {
          interpolatedMessage += variables[fragment.replace(/\{\}\s/g, "")]
        } else {
          interpolatedMessage += fragment
        }
      })

      return interpolatedMessage
    }

    function makeValidator (testFn, messageTemplate) {
      return function (util, customEqualityTesters) {
        return {
          compare: function (actual, expected) {
            assertJqueryElement(actual)

            var result = {
              pass: testFn(util, customEqualityTesters, actual, expected)
            }

            result.message = interpolateMessage(messageTemplate, {
              actual: jQueryElementToString(actual)
            })
            return result
          }
        }
      }
    }

    return {
      toBeVisible: makeValidator(
        function (util, customEqualityTesters, actual) {
          return util.equals(actual.is(":visible"), true, customEqualityTesters)
        },
        "Expected {{ actual }} to be visible"
      ),
      toBeHidden: makeValidator(
        function (util, customEqualityTesters, actual) {
          return util.equals(actual.is(":hidden"), true, customEqualityTesters)
        },
        "Expected {{ actual }} to be hidden"
      ),
      toExist: makeValidator(
        function (util, customEqualityTesters, actual) {
          return util.equals(actual.length > 0, true, customEqualityTesters)
        },
        "Expected {{ actual }} to exist"
      ),
      toNotExist: makeValidator(
        function (util, customEqualityTesters, actual) {
          return util.equals(actual.length === 0, true, customEqualityTesters)
        },
        "Expected {{ actual }} to not exist"
      ),
      toBeEmpty: makeValidator(
        function (util, customEqualityTesters, actual) {
          return util.equals(actual.is(":empty"), true, customEqualityTesters)
        },
        "Expected {{ actual }} to be empty"
      )
    }
  })
