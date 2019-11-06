"use strict"

define(["../dialog/DeleteModelDialog",
  "../model/Album",
  "../util/Communicator",
  "../tests/loadTestEnv!"],
function (DeleteModelDialog, Album, communicator, $testBody) {
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

    it("should delete model", function (done) {
      var model = new Album({
        id: 1,
        title: "Foo"
      })
      spyOn(model, "delete").and.callFake(function () {
        model._trigger("deleted")
      })

      dialog.show(model)

      // Check that templated has been loaded
      expect($("form[name='delete-model']")).toExist()

      communicator.subscribeOnce("deleted:Model", function () {
        done()
      })
      dialog._submitForm()
    })
  })
})
