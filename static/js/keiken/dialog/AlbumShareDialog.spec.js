"use strict"

define(["../dialog/AlbumShareDialog",
  "../model/Album",
  "../tests/loadTestEnv!"],
function (AlbumShareDialog, Album, $testBody) {
  describe("AlbumShareDialog", function () {
    var dialog

    beforeEach(function () {
      dialog = new AlbumShareDialog()
      $testBody
        .empty()
        .append($("<div/>").attr("id", dialog.WRAPPER_ID))
    })

    afterEach(function () {
      dialog.close()
    })

    it("should update password", function () {
      var album = new Album({
        id: 1,
        title: "Title",
        description: "Description"
      })
      spyOn(album, "updatePassword")

      dialog.show(album)
      $("input[name='password']").val("New password")
      dialog._submitForm()

      expect(album.updatePassword).toHaveBeenCalledWith("New password")
    })
  })
})