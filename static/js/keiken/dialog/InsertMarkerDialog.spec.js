"use strict"

define(["../dialog/InsertMarkerDialog",
  "../model/Album",
  "../model/Collection",
  "../tests/loadTestEnv!"],
function (InsertMarkerDialog, Album, Collection, $testBody) {
  describe("InsertMarkerDialog", function () {
    var dialog

    beforeEach(function () {
      dialog = new InsertMarkerDialog()
      $testBody
        .empty()
        .append($("<div/>").attr("id", dialog.WRAPPER_ID))
    })

    afterEach(function () {
      dialog.close()
    })

    it("should save place", function () {
      var place = dialog.showPlace(new Album({
        id: 1,
        title: "Foo",
        places: []
      }), 50, 40)
      spyOn(place, "save")

      $("input[name='title']").val("Title")
      $("textarea[name='description']").val("Description")

      dialog._submitForm()

      expect(place.save).toHaveBeenCalledWith({
        title: "Title",
        description: "Description",
        lat: "50",
        lon: "40",
        album: "1"
      })
    })
    it("should save album", function () {
      var album = dialog.showAlbum(new Collection([], {
        modelType: "Album"
      }), 50, 40)
      spyOn(album, "save")

      $("input[name='title']").val("Title")
      $("textarea[name='description']").val("Description")

      dialog._submitForm()

      expect(album.save).toHaveBeenCalledWith({
        title: "Title",
        description: "Description",
        lat: "50",
        lon: "40"
      })
    })
  })
})
