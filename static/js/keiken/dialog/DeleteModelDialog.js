define(["dojo/_base/declare",
  "./_ModelDialogBase",
  "dojo/text!./templates/DeleteModelForm.html"],
function (declare, _ModelDialogBase, templateString) {
  return declare(_ModelDialogBase, {

    show: function (model) {
      this.inherited("show", arguments, [{
        model: model,
        submit: function () {
          model.delete()
        },
        title: gettext("Confirm delete"),
        context: {
          deleteModelQuestion: interpolate(gettext("Do you really want to delete %s?"), [model.getType() + " - " + model.getTitle()])
        },
        templateString: templateString
      }])
    }
  })
})
