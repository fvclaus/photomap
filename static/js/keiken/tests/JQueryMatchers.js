"use strict"

define([],
  function () {
    function assertJqueryElement (element) {
      if (!(element instanceof $)) {
        throw new Error("Element " + element + " is not a jquery element.")
      }
    }

    function jQueryElementToString (element) {
      return element[0].outerHTML
    }

    return {
      toBeVisible: function (util, customEqualityTesters) {
        return {
          compare: function (actual, expected) {
            assertJqueryElement(actual)

            var result = {
              pass: util.equals(actual.is(":visible"), true, customEqualityTesters)
            }

            result.message = "Expected " + jQueryElementToString(actual) + " to " + (result.pass ? " not " : "") + " be visible"
            return result
          }
        }
      },
      toBeHidden: function (util, customEqualityTesters) {
        return {
          compare: function (actual, expected) {
            assertJqueryElement(actual)

            var result = {
              pass: util.equals(actual.is(":hidden"), true, customEqualityTesters)
            }

            result.message = "Expected " + jQueryElementToString(actual) + " to " + (result.pass ? "" : " not ") + " be visible"
            return result
          }
        }
      }
    }
  })
