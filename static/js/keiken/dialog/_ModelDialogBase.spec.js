"use strict"

define(["../dialog/_ModelDialogBase",
  "../model/Album",
  "../util/Communicator",
  "../tests/loadTestEnv!"],
function (_ModelDialogBase, Album, communicator, $testBody) {
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
      $testBody
        .empty()
        .append($("<div/>").attr("id", dialog.WRAPPER_ID))
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

    ["inserted", "updated", "deleted"].forEach(function (eventType) {
      it("should publish " + eventType + " event", function (done) {
        showDialog(function () {
          // This should show success message
          album._trigger("success")
          // This should publish event
          album._trigger(eventType)
        })
        communicator.subscribe(eventType + ":Model", function () {
          done()
        })

        spyOn(dialog, "showSuccessMessage")
        dialog._submitForm()
        expect(dialog.showSuccessMessage).toHaveBeenCalled()
      })
    })

    it("should show failure message", function () {
      showDialog(function () {
        album._trigger("failure")
      })
      spyOn(dialog, "showFailureMessage")
      dialog._submitForm()
      expect(dialog.showFailureMessage).toHaveBeenCalled()
    })

    it("should show error message", function () {
      showDialog(function () {
        album._trigger("error")
      })
      spyOn(dialog, "showNetworkErrorMessage")
      dialog._submitForm()
      expect(dialog.showNetworkErrorMessage).toHaveBeenCalled()
    })
  })
})
