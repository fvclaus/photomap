"use strict"

define(["../dialog/UpdateModelDialog",
  "../model/Album",
  "../tests/loadTestEnv!"],
function (UpdateModelDialog, Album, $testBody) {
  describe("UpdateModelDialog", function () {
    var dialog

    beforeEach(function () {
      dialog = new UpdateModelDialog()
      $testBody
        .empty()
        .append($("<div/>").attr("id", dialog.WRAPPER_ID))
    })

    afterEach(function () {
      dialog.close()
    })

    it("should update model", function () {
      var model = new Album({
        id: 1,
        title: "Title",
        description: "Description"
      })
      spyOn(model, "save")

      dialog.show(model)
      $("input[name='title']").val("New title")
      $("textarea[name='description']").val("New description")
      dialog._submitForm()

      expect(model.save).toHaveBeenCalledWith({
        title: "New title",
        description: "New description"
      })
    })
  })
})
