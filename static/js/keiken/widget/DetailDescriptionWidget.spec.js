"use strict"

define(["./DetailDescriptionWidget",
  "../model/Photo",
  "../util/Communicator",
  "../tests/loadTestEnv!"],
function (DetailDescriptionWidget, Photo, communicator, TestEnv) {
  describe("DetailDescriptionWidget", function () {
    var widget

    var multiplyString = function (string, times) {
      var multipliedString
      for (var i = 0; i < times; i++) {
        multipliedString += string
      }
      return multipliedString
    }

    var photoNoDescription = new Photo({
      title: "Photo 100"
    })
    var photoShortDescription = new Photo({
      title: "Photo 200",
      description: "Description Photo 200"
    })
    var photoLongDescription = new Photo({
      title: "Photo Long Description",
      description: "This is a " + multiplyString("very ", 50) + "long description"
    })

    // beforeEach(function () {
    //   var t = new TestEnv().createWidget(null, DetailWidget)
    //
    //   widget = t.widget; $domNode = t.$domNode
    //
    //   widget.startup()
    // })

    afterEach(function () {
      widget.destroy()
      communicator.clear()
    })

    var itWithLongDescription = TestEnv.wrapJasmineItSyncSetup(function () {
      var t = new TestEnv().createWidget({
        abbreviateDescription: false
      }, DetailDescriptionWidget)

      widget = t.widget

      widget.startup()
    })

    itWithLongDescription("should display full description", function () {
      widget.show(photoLongDescription)
      expect(widget.$description).toHaveText(photoLongDescription.description)
      expect(widget.$title).toHaveText(photoLongDescription.title)
    })

    var itWithShortDescription = TestEnv.wrapJasmineItSyncSetup(function () {
      var t = new TestEnv().createWidget({
        abbreviateDescription: true
      }, DetailDescriptionWidget)

      widget = t.widget

      widget.startup()
    })

    itWithShortDescription("should display abbreviated long description", function () {
      widget.show(photoLongDescription)
      expect(widget.$insertDescription).toBeUndefined()
      expect(photoLongDescription.description.length).toBeGreaterThan(widget.$description.text().length)
      expect(widget.$title).toHaveText(photoLongDescription.title)
    })

    itWithShortDescription("should display short description", function () {
      widget.show(photoShortDescription)
      expect(widget.$description).toHaveText(photoShortDescription.description)
    })

    itWithShortDescription("should display empty description", function () {
      widget.show(photoNoDescription)
      expect(widget.$description).toHaveText("")
    })

    itWithShortDescription("should call onShowDetail when detail link is pressed", function (done) {
      widget.show(photoLongDescription)
      widget.options.onShowDetail = function () {
        expect(arguments.length).toBe(0)
        done()
      }
      widget.$detailLink.trigger("click")
    })

    var itWithAdmin = TestEnv.wrapJasmineItSyncSetup(function () {
      var t = new TestEnv().createWidget({
        isAdmin: true
      }, DetailDescriptionWidget)

      widget = t.widget

      widget.startup()
    })

    itWithAdmin("should call onInsertDescription when insert link is pressed", function (done) {
      widget.show(photoNoDescription)
      expect(widget.$insertDescription).toBeVisible()
      widget.options.onInsertDescription = function () {
        expect(arguments.length).toBe(0)
        done()
      }
      widget.$insertDescription.trigger("click")
    })
  })
})
