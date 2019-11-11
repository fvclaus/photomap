"use strict"

define(["../dialog/PhotoInsertDialog",
  "../model/Place",
  "../tests/mockInputFiles",
  "../tests/loadTestEnv!"],
function (PhotoInsertDialog, Place, mockInputFiles, $testBody) {
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

      var validator = $.data(dialog._findForm().get(0), "validator")
      function isPhotoFileInput (el) {
        return el.name === "photo"
      }
      mockInputFiles(validator, isPhotoFileInput, [new File(["foo"], "foo.jpeg", {
        type: "image/jpeg"
      })])

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
