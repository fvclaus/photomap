"use strict"

define(["../dialog/DeleteModelDialog",
  "../model/Album",
  "../tests/ModelServerTest",
  "../util/Communicator",
  "../tests/loadTestEnv!"],
function (DeleteModelDialog, Album, ModelServerTest, communicator, $testBody) {
  describe("DeleteModelDialog", function () {
    var $container
    var dialog
    var server
    beforeEach(function () {
      $container = $("<div id='mp-dialog'/>")
      $testBody
        .empty()
        .append($container)
      try {
        dialog = new DeleteModelDialog()
      } catch (e) {
        console.error(e)
        throw e
      }
      server = new ModelServerTest()
    })

    afterEach(function () {
      dialog.close()
    })

    it("should delete model", function (done) {
      dialog.show(new Album({
        id: 1,
        title: "Foo"
      }))
      server.mockSuccessfulDeleteResponse("/album/1/")
      communicator.subscribeOnce("deleted:Model", function () {
        done()
      })
      $("#mp-dialog-button-yes").trigger("click")
    })
    it("should show failure message", function (done) {
      dialog.show(new Album({
        id: 1,
        title: "Foo"
      }))
      server.mockFailureResponse({}, "/album/1/")
      $("#mp-dialog-button-yes").trigger("click")
      var intervalFn = setInterval(function () {
        if ($("#mp-dialog-message-failure").is(":visible")) {
          done()
          clearInterval(intervalFn)
        }
      }, 100)
      // Remove in case this spec fails
      setTimeout(function () {
        clearInterval(intervalFn)
      }, jasmine.DEFAULT_TIMEOUT_INTERVAL)
    })
  })
})
