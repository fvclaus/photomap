"use strict"

define(["../dialog/ModelUpdateDialog",
  "../model/Album",
  "../tests/loadTestEnv!"],
function (ModelUpdateDialog, Album, TestEnv) {
  describe("ModelUpdateDialog", function () {
    var dialog

    beforeEach(function () {
      dialog = new ModelUpdateDialog()
      new TestEnv().createContainer(dialog.WRAPPER_ID)
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
