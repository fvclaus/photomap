"use strict"

define(["./Dialog",
  "../util/ClientState",
  "../tests/loadTestEnv!"],
function (Dialog, clientState, $testBody) {
  describe("Dialog", function () {
    var dialog
    var $contentNode

    beforeEach(function () {
      dialog = new Dialog()
      $testBody
        .empty()
        .append($("<div/>").attr("id", dialog.WRAPPER_ID))
      // Form is required to make submit work.
      $contentNode = $("<div><form name='test-form'><input name='foo'/><input name='bar'/></form><p>Test form content</p></div>")
    })

    afterEach(function () {
      try {
        dialog.close()
      } catch (e) {
        // Ignore
      }
      clientState.setDialogAutoClose(false)
    })

    function showDialog (options) {
      dialog.show($.extend({
        contentNode: $contentNode.get(0),
        title: "Test",
        submit: function () {}
      }, options))
    }

    function findTestForm () {
      return $("form[name='test-form']")
    }

    function findDialogWrapper () {
      return $("#" + dialog.WRAPPER_ID)
    }

    function triggerSubmit () {
      var selector
      switch (dialog.options.type) {
        case dialog.INPUT_DIALOG:
          selector = "mp-dialog-button-save"
          break
        case dialog.CONFIRM_DIALOG:
          selector = "mp-dialog-button-yes"
          break
        case dialog.ALERT_DIALOG:
          selector = "mp-dialog-button-ok"
          break
        default:
          throw new Error("Unknown type " + dialog.options.type)
      }
      $("#" + selector).trigger("click")
    }

    it("should show content", function () {
      showDialog()
      expect(findTestForm()).toExist()
    })

    it("should return form data", function (done) {
      $contentNode.find("input[name='foo']").val("foo")
      $contentNode.find("input[name='bar']").val("bar")
      showDialog({
        type: dialog.CONFIRM_DIALOG,
        submit: function (formData) {
          expect(formData.foo).toBe("foo")
          expect(formData.bar).toBe("bar")
          done()
        }
      })
      triggerSubmit()
    })

    it("should close", function () {
      showDialog()
      dialog.close()
      expect(findDialogWrapper()).toBeEmpty()
    })

    it("should close when autoClose is configured", function () {
      clientState.setDialogAutoClose(true)
      showDialog({
        submit: function () {
          dialog.showSuccessMessage()
        }
      })
      triggerSubmit()
      expect(findDialogWrapper()).toBeEmpty()
    })

    it("should show success message", function () {
      showDialog({
        submit: function () {
          dialog.showSuccessMessage()
        }
      })
      spyOn(dialog.message, "showSuccess")
      triggerSubmit()
      expect(dialog.message.showSuccess).toHaveBeenCalled()
    })

    it("should show network error message", function () {
      showDialog({
        submit: function () {
          dialog.showNetworkErrorMessage()
        }
      })
      spyOn(dialog.message, "showFailure")
      triggerSubmit()
      expect(dialog.message.showFailure).toHaveBeenCalled()
    })

    it("should show failure message", function () {
      showDialog({
        submit: function () {
          dialog.showFailureMessage({
            error: "Something went wrong"
          })
        }
      })
      spyOn(dialog.message, "showFailure")
      triggerSubmit()
      expect(dialog.message.showFailure).toHaveBeenCalledWith("Something went wrong")
    })
  })
})
