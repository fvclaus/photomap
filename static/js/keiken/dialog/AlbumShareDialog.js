define(["dojo/_base/declare",
  "./_ModelDialogBase",
  "dojo/text!./templates/AlbumShareForm.html"],
function (declare, _ModelDialogBase, templateString) {
  return declare(_ModelDialogBase, {

    show: function (album) {
      this.inherited("show", arguments, [{
        model: album,
        submit: function (data, errorFn) {
          album.updatePassword(data.password, errorFn)
        },
        title: gettext("Share-link & album password"),
        templateContext: {
          url: album.getUrl("http://" + window.location.host)
        },
        type: this.INPUT_DIALOG,
        templateString: templateString
      }])
    }
  })
})
