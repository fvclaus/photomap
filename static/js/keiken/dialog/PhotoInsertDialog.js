define(["dojo/_base/declare",
  "./_ModelDialogBase",
  "../model/Photo",
  "dojo/text!./templates/PhotoInsertForm.html",
  "../util/loadPhotoFileValidation!"],
function (declare, _ModelDialogBase, Photo, templateString) {
  return declare(_ModelDialogBase, {

    show: function (place) {
      var photo = new Photo()
      this.inherited("show", arguments, [{
        model: photo,
        submit: function (data, errorFn) {
          var photoFile = this._findForm().find("input[name='photo']").get(0).files[0]
          data.photo = photoFile
          photo.save(data, errorFn)
        },
        collection: place.getPhotos(),
        title: gettext("You can add photos to the place by clicking on the 'Record' button on the right side of the gallery"),
        templateContext: {
          placeId: place.getId()
        },
        type: this.INPUT_DIALOG,
        templateString: templateString
      }])
      return photo
    }
  })
})
