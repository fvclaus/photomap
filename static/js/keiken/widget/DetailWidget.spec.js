"use strict"

define(["./DetailWidget",
  "../model/Photo",
  "../util/Communicator",
  "dojo/_base/declare",
  "./_Widget",
  "../tests/loadTestEnv!"],
function (DetailWidget, Photo, communicator, declare, _Widget, TestEnv) {
  describe("DetailWidget", function () {
    var widget

    var photo = new Photo({
      title: "Photo",
      description: "Description"
    })

    afterEach(function () {
      widget.destroy()
      communicator.clear()
    })

    var itWithoutChildren = TestEnv.wrapJasmineItSyncSetup(function () {
      var t = new TestEnv().createWidget(null, DetailWidget)

      widget = t.widget

      widget.startup()
    })

    itWithoutChildren("should display full description widget", function () {
      spyOn(widget.fullDescription, "show")
      widget.show(photo)
      expect(widget.fullDescription.show).toHaveBeenCalledWith(photo)
      expect(widget.$shortDescriptionWrapper).toBeHidden()
      expect(widget.$fullDescriptionWrapper).toBeVisible()
    })

    itWithoutChildren("should update description widget when model changes", function () {
      widget.show(photo)
      spyOn(widget.fullDescription, "show")
      photo._trigger("update", photo)
      expect(widget.fullDescription.show).toHaveBeenCalledWith(photo)
    })

    itWithoutChildren("should empty widget when model is deleted", function () {
      widget.show(photo)
      spyOn(widget.fullDescription, "empty")
      photo._trigger("delete", photo)
      expect(widget.fullDescription.empty).toHaveBeenCalled()
    })

    var itWithChildren = TestEnv.wrapJasmineItSyncSetup(function () {
      var Widget = declare(_Widget, {
        viewName: "DetailWidgetWithChildren",
        templateString: "<div>" +
        " <div data-dojo-type='keiken/widget/DetailWidget' " +
        "      data-widget-instance-name='detail'>" +
        "   <span>My content</span>" +
        " </div>" +
        "</div>"
      })
      var t = new TestEnv().createWidget(null, Widget)

      widget = t.widget.detail

      widget.startup()
    })

    itWithChildren("should display short description widget", function () {
      spyOn(widget.shortDescription, "show")
      widget.show(photo)
      expect(widget.shortDescription.show).toHaveBeenCalledWith(photo)
      expect(widget.$shortDescriptionWrapper).toBeVisible()
      expect(widget.$fullDescriptionWrapper).toBeHidden()
    })

    itWithChildren("should open full description widget when user expands short description", function () {
      widget.show(photo)
      spyOn(widget.fullDescription, "show")
      widget._showFullDescription()
      expect(widget.fullDescription.show).toHaveBeenCalledWith(photo)
      expect(widget.$shortDescriptionWrapper).toBeHidden()
      expect(widget.$fullDescriptionWrapper).toBeVisible()
    })

    itWithChildren("should close full description after opening full description", function () {
      widget.show(photo)
      widget._showFullDescription()
      spyOn(widget.shortDescription, "show")
      widget._close()
      expect(widget.shortDescription.show).toHaveBeenCalledWith(photo)
      expect(widget.$shortDescriptionWrapper).toBeVisible()
      expect(widget.$fullDescriptionWrapper).toBeHidden()
    })
  })
})
