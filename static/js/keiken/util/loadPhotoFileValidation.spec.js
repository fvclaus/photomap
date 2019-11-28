"use strict"

define(["../tests/loadTestEnv!",
  "../tests/mockInputFiles",
  "./loadPhotoFileValidation!"],
function (TestEnv, mockInputFiles) {
  var $container
  var validator

  describe("PhotoFileValidation", function () {
    function isFileInputEl (el) {
      return el.name === "fileInput"
    }

    function submitForm () {
      $container.find("[type='submit']").trigger("click")
    }

    beforeEach(function () {
      $container = TestEnv.createCustomContainer($("<form target=''><input type='file' class='$photoValidation' name='fileInput'/><input type='submit'/></form>"))
    });

    [
      {
        files: [{
          size: 4e+6,
          type: "image/jpeg"
        }],
        name: "should reject too large photos"
      },
      {
        files: [{
          size: 1e+6,
          type: "applicaton/pdf"
        }],
        name: "should reject files that are not images"
      },
      {
        files: [{
          size: 1e+6,
          type: "image/jpeg"
        }, {
          size: 1e+6,
          type: "image/jpeg"
        }],
        name: "should reject multiple files"
      }
    ].forEach(function (testDefinition) {
      it(testDefinition.name, function () {
        validator = $container.validate({
          submitHandler: function () {
            throw new Error("This should not be called")
          }
        })
        mockInputFiles(validator, isFileInputEl, testDefinition.files)

        submitForm()
        expect($container.find(".error")).toExist()
      })
    })

    it("should valid photo", function (done) {
      validator = $container.validate({
        submitHandler: function () {
          done()
        },
        success: "valid"
      })
      mockInputFiles(validator, isFileInputEl, [{
        size: 1e+6,
        type: "image/jpeg"
      }])

      submitForm()
    })
  })
})
