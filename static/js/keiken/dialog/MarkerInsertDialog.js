define(["dojo/_base/declare",
  "./_ModelDialogBase",
  "../model/Place",
  "../model/Album",
  "dojo/text!./templates/MarkerInsertForm.html"],
function (declare, _ModelDialogBase, Place, Album, templateString) {
  return declare(_ModelDialogBase, {

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
        submit: function (data) {
          options.model.save(data)
        },
        type: this.INPUT_DIALOG,
        templateString: templateString
      })])
    }
  })
})