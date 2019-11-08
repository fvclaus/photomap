define(["dojo/_base/declare",
  "./_ModelDialogBase",
  "../model/Photo",
  "dojo/text!./templates/InsertPhotoForm.html",
  "../util/PhotoFileValidator"],
function (declare, _ModelDialogBase, Photo, templateString) {
  return declare(_ModelDialogBase, {

    show: function (place) {
      var photo = new Photo()
      this.inherited("show", arguments, [{
        model: photo,
        submit: function (data) {
          var photoFile = this._findForm().find("input[name='photo']").get(0).files[0]
          data.photo = photoFile
          photo.save(data)
        },
        collection: place.getPhotos(),
        title: gettext("You can add photos to the place by clicking on the 'Record' button on the right side of the gallery"),
        templateContext: {
          placeId: place.getId()
        },
        templateString: templateString
      }])
      return photo
    }
  })
})
