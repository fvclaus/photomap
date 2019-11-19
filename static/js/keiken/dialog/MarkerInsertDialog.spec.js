"use strict"

define(["../dialog/MarkerInsertDialog",
  "../model/Album",
  "../model/Collection",
  "../tests/loadTestEnv!"],
function (MarkerInsertDialog, Album, Collection, TestEnv) {
  describe("MarkerInsertDialog", function () {
    var dialog

    beforeEach(function () {
      dialog = new MarkerInsertDialog()
      new TestEnv().createContainer(dialog.WRAPPER_ID)
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
