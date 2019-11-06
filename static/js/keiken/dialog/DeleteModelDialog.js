define(["dojo/_base/declare",
  "./Dialog",
  "../util/Communicator",
  "./renderDialogTemplate",
  "dojo/text!./templates/DeleteModelForm.html"],
function (declare, Dialog, communicator, renderDialogTemplate, templateString) {
  return declare(Dialog, {

    show: function (model) {
      var instance = this

      this.inherited("show", arguments, [{
        submit: function () {
          model
            .onSuccess(function (data) {
              instance.showResponseMessage(data)
            })
            .onDelete(function () {
              communicator.publish("deleted:Model", model)
            })
            .onFailure(function (data) {
              instance.showResponseMessage(data)
            })
            .onError(function () {
              // this needs to be dialog
              instance.showNetworkError()
            })

          model.delete()
        },
        type: this.CONFIRM_DIALOG,
        title: gettext("Confirm delete"),
        contentNode: renderDialogTemplate(templateString, {
          deleteModelQuestion: interpolate(gettext("Do you really want to delete %s?"), [model.getType() + " - " + model.getTitle()])
        })
      }])
    }
  })
})
