"use strict"

define(["../dialog/_ModelDialogBase",
  "../model/Album",
  "../util/Communicator",
  "../tests/loadTestEnv!"],
function (_ModelDialogBase, Album, communicator, TestEnv) {
  describe("_ModelDialogBase", function () {
    var dialog
    var templateString = "<div><form></form><p>Testing _ModelDialogBase</p></div>"
    var album

    beforeEach(function () {
      album = new Album({
        id: 1,
        title: "Foo"
      })
      dialog = new _ModelDialogBase()
      new TestEnv().createContainer(dialog.WRAPPER_ID)
      communicator.clear()
    })

    afterEach(function () {
      dialog.close()
    })

    function showDialog (submit) {
      dialog.show({
        model: album,
        templateString: templateString,
        title: "Test",
        submit: submit
      })
    }

    ["insert", "update", "delete"].forEach(function (eventType) {
      it("should publish " + eventType + " event", function () {
        showDialog(function () {
          album._trigger(eventType)
        })

        spyOn(dialog, "showSuccessMessage")
        dialog._submitForm()
        expect(dialog.showSuccessMessage).toHaveBeenCalled()
      })
    })

    it("should show failure message", function () {
      // eslint-disable-next-line no-unused-vars
      showDialog(function (data, errorFn) {
        errorFn({
          error: "error"
        })
      })
      spyOn(dialog, "showFailureMessage")
      dialog._submitForm()
      expect(dialog.showFailureMessage).toHaveBeenCalled()
    })
  })
})
