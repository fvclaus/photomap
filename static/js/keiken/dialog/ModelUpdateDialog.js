define(["dojo/_base/declare",
  "./_ModelDialogBase",
  "dojo/text!./templates/ModelUpdateForm.html"],
function (declare, _ModelDialogBase, templateString) {
  return declare(_ModelDialogBase, {

    show: function (model) {
      this.inherited("show", arguments, [{
        model: model,
        submit: function (data, errorFn) {
          model.save(data, errorFn)
        },
        title: gettext("Update form"),
        templateContext: {
          title: model.getTitle(),
          description: model.getDescription()
        },
        templateString: templateString
      }])
    }
  })
})
