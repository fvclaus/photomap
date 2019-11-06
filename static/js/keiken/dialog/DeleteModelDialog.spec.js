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
    it("should show failure message", function () {
      dialog.show(new Album({
        id: 1,
        title: "Foo"
      }))
      server.mockFailureResponse({}, "/album/1/")
      var $failureMessage = $("#mp-dialog-message-failure")
      expect($failureMessage).toBeHidden()
      $("#mp-dialog-button-yes").trigger("click")
      expect($failureMessage).toBeVisible()
    })
  })
})
