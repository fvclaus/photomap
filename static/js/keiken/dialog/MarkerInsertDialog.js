define(["dojo/_base/declare",
  "./_ModelDialogBase",
  "../model/Collection",
  "../model/Place",
  "../model/Album",
  "dojo/text!./templates/MarkerInsertForm.html"],
function (declare, _ModelDialogBase, Collection, Place, Album, templateString) {
  return declare(_ModelDialogBase, {

    showAlbumOrPlace: function (model, lat, lng) {
      assertTrue(model.constructor === Album || (model.constructor === Collection && model.type === "Album"))
      if (model.constructor === Album) {
        this.showPlace(model, lat, lng)
      } else {
        this.showAlbum(model, lat, lng)
      }
    },
    showPlace: function (album, lat, lng) {
      var place = new Place()
      this._show({
        model: place,
        title: gettext("Insert Place"),
        collection: album.getPlaces(),
        templateContext: {
          lat: lat,
          lon: lng,
          albumId: album.getId()
        }
      })
      return place
    },
    showAlbum: function (albumCollection, lat, lng) {
      var album = new Album()
      this._show({
        model: album,
        title: gettext("Insert Album"),
        collection: albumCollection,
        templateContext: {
          lat: lat,
          lon: lng
        }
      })
      return album
    },
    _show: function (options) {
      this.inherited("show", arguments, [$.extend(options, {
        submit: function (data, errorFn) {
          options.model.save(data, errorFn)
        },
        type: this.INPUT_DIALOG,
        templateString: templateString
      })])
    }
  })
})
