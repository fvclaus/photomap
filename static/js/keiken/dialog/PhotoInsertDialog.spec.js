"use strict"

define(["../dialog/PhotoInsertDialog",
  "../model/Place",
  "../tests/loadTestEnv!"],
function (PhotoInsertDialog, Place, $testBody) {
  describe("PhotoInsertDialog", function () {
    var dialog
    var jQuery = $

    beforeEach(function () {
      dialog = new PhotoInsertDialog()
      $testBody
        .empty()
        .append($("<div/>").attr("id", dialog.WRAPPER_ID))
    })

    afterEach(function () {
      dialog.close()
      // eslint-disable-next-line no-global-assign
      $ = jQuery
    })

    it("should insert photo", function () {
      var photo = dialog.show(new Place({
        id: 1,
        title: "Title",
        description: "Description"
      }))
      spyOn(photo, "save")
      $("input[name='title']").val("Title")
      $("textarea[name='description']").val("Description")

      function isPhotoFileInput (el) {
        return el instanceof HTMLInputElement && el.name === "photo"
      }
      var validator = $.data(dialog._findForm().get(0), "validator")

      var origElementsFn = validator.elements
      spyOn(validator, "elements").and.callFake(function () {
        var elements = origElementsFn.call(this)
        for (var i = 0; i < elements.length; i++) {
          var el = elements[i]
          if (isPhotoFileInput(el)) {
            elements[i] = new Proxy(el, {
              get: function (obj, prop) {
                var value = obj[prop]
                if (typeof value === "function") {
                  return function () {
                    return value.apply(obj, arguments)
                  }
                } else if (prop === "files") {
                  return [new File(["foo"], "foo.jpeg", {
                    type: "image/jpeg"
                  })]
                } else {
                  return obj[prop]
                }
              },
              set: function (obj, prop, newVal) {
                obj[prop] = newVal
              }
            })
          }
        }
        return elements
      })
      var origElementValueFn = validator.elementValue
      spyOn(validator, "elementValue").and.callFake(function (el) {
        if (isPhotoFileInput(el)) {
          return "fileName"
        } else {
          return origElementValueFn.call(this, el)
        }
      })
      dialog._submitForm()

      expect(photo.save).toHaveBeenCalledWith({
        place: "1",
        title: "Title",
        description: "Description",
        photo: undefined
      })
    })
  })
})
