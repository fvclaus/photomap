"use strict"

define(["../dialog/ModelDeleteDialog",
  "../model/Album",
  "../tests/loadTestEnv!"],
function (ModelDeleteDialog, Album, $testBody) {
  describe("DeleteModelDialog", function () {
    var dialog

    beforeEach(function () {
      dialog = new ModelDeleteDialog()
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
