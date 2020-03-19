"use strict"

define(["keiken/widget/ModelOperationWidget",
  "../model/Album",
  "../util/Communicator",
  "../tests/loadTestEnv!"],
function (ModelOperationWidget, Album, communicator, TestEnv) {
  describe("ModelOperationWidget", function () {
    var widget
    var $domNode

    beforeEach(function () {
      var t = new TestEnv().createWidget({
        includeShareOperation: true
      }, ModelOperationWidget)

      widget = t.widget; $domNode = widget.$domNode
      widget.startup()
    })

    afterEach(function () {
      widget.destroy()
    })

    var itWithAlbum = TestEnv.wrapJasmineItSyncSetup(function () {
      widget.show({
        model: new Album({
          title: "Album"
        }),
        offset: $("body").offset(),
        dimensions: {
          width: 18
        }
      })
    })

    it("should hide on startup", function () {
      expect($domNode).toBeHidden()
    })

    it("should center above item", function () {
      var $text = TestEnv.append("<span style='position: absolute; top: 200px; left: 200px'>Center above me</span>", true)
      widget.show({
        model: null,
        offset: $text.offset(),
        dimensions: {
          width: $text.outerWidth(true)
        }
      })
      console.log()
    })

    itWithAlbum("should be visible after show", function () {
      expect($domNode).toBeVisible()
    })

    itWithAlbum("should hide after mouseleave", function () {
      widget.domNode.dispatchEvent(new Event("mouseenter"))
      widget.domNode.dispatchEvent(new Event("mouseleave"))
      expect($domNode).toBeHidden()
    })

    itWithAlbum("should not hide when mouse inside widget", function () {
      widget.domNode.dispatchEvent(new Event("mouseenter"))
      widget.hide()
      expect($domNode).toBeVisible()
    })

    itWithAlbum("should hide after some time", function (done) {
      widget.hideAfterDelay(100)
      expect($domNode).toBeVisible()
      setTimeout(function () {
        expect($domNode).toBeHidden()
        done()
      }, 110)
    });

    [{
      eventNs: "UpdateOperation",
      elName: "$update"
    }, {
      eventNs: "DeleteOperation",
      elName: "$delete"
    }, {
      eventNs: "ShareOperation",
      elName: "$share"
    }].forEach(function (testDefinition) {
      itWithAlbum("should publish " + testDefinition.eventNs, function (done) {
        communicator.subscribeOnce("clicked:" + testDefinition.eventNs, function (model) {
          expect(model.title).toEqual("Album")
          done()
        })
        widget[testDefinition.elName].trigger("click")
      })
    })
  })
})
