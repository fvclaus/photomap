"use strict"

define(["../dialog/AlbumShareDialog",
  "../model/Album",
  "../tests/loadTestEnv!"],
function (AlbumShareDialog, Album, TestEnv) {
  describe("AlbumShareDialog", function () {
    var dialog

    beforeEach(function () {
      dialog = new AlbumShareDialog()
      new TestEnv().createContainer(dialog.WRAPPER_ID)
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

      expect(album.updatePassword).toHaveBeenCalledWith("New password", jasmine.any(Function))
    })
  })
})
