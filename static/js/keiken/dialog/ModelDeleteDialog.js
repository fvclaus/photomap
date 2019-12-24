define(["dojo/_base/declare",
  "./_ModelDialogBase",
  "dojo/text!./templates/ModelDeleteForm.html"],
function (declare, _ModelDialogBase, templateString) {
  return declare(_ModelDialogBase, {

    show: function (model) {
      this.inherited("show", arguments, [{
        model: model,
        // eslint-disable-next-line no-unused-vars
        submit: function (data, errorFn) {
          model.delete(errorFn)
        },
        title: gettext("Confirm delete"),
        templateContext: {
          deleteModelQuestion: interpolate(gettext("Do you really want to delete %s?"), [model.getType() + " - " + model.getTitle()])
        },
        templateString: templateString
      }])
    }
  })
})
