"use strict"

define(["../dialog/DeleteModelDialog",
  "../model/Album",
  "../tests/loadTestEnv!"],
function (DeleteModelDialog, Album, $testBody) {
  describe("DeleteModelDialog", function () {
    var dialog

    beforeEach(function () {
      dialog = new DeleteModelDialog()
      $testBody
        .empty()
        .append($("<div/>").attr("id", dialog.WRAPPER_ID))
    })

    afterEach(function () {
      dialog.close()
    })

    it("should delete model", function () {
      var model = new Album({
        id: 1,
        title: "Foo"
      })
      spyOn(model, "delete")

      dialog.show(model)
      dialog._submitForm()

      expect(model.delete).toHaveBeenCalled()
    })
  })
})
