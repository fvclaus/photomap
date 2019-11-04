"use strict"

define(["../util/PhotoFileValidator",
  "./loadTestEnv!"],
function (PhotoFileValidator, $testBody) {
  var validator = new PhotoFileValidator()
  var $container = null
  var generateEvent = function (size, mimeType) {
    return {
      target: {
        files: [{
          size: size,
          type: mimeType
        }]
      }
    }
  }

  describe("PhotoFileValidator", function () {
    beforeEach(function () {
      $container = $("<input type='file' />")
      $testBody
        .empty()
        .append($container)
      $container = $testBody.find("input").eq(0)
    })
    it("should show warning for large photos", function () {
      validator.validate($container, generateEvent(2 * Math.pow(2, 20), "image/jpeg"))
      expect($testBody.find(".ui-state-highlight")).toExist()
    })
    it("should show error for wrong mime type", function () {
      validator.validate($container, generateEvent(300, "application/pdf"))
      expect($testBody.find(".ui-state-error")).toExist()
    })
    it("should show no warning/error", function () {
      validator.validate($container, generateEvent(300, "image/jpeg"))
      expect($testBody.find("div")).toNotExist()
      expect(validator.getFile()).toBeDefined()
    })
  })
})
