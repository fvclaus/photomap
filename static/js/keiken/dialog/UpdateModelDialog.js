define(["dojo/_base/declare",
  "./_ModelDialogBase",
  "dojo/text!./templates/UpdateModelForm.html"],
function (declare, _ModelDialogBase, templateString) {
  return declare(_ModelDialogBase, {

    show: function (model) {
      this.inherited("show", arguments, [{
        model: model,
        submit: function (data) {
          model.save(data)
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
