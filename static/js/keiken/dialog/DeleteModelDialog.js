define(["dojo/_base/declare",
  "./_Dialog",
  "../util/Communicator",
  "../widget/TemplateDirectives",
  "dijit/_TemplatedMixin",
  "dojox/dtl/_DomTemplated",
  "dojox/dtl/Context",
  "dojox/dtl/_base",
  "dojox/dtl/tag/loader",
  "dojox/dtl/render/dom",
  "./renderDialogTemplate",
  "dojo/text!./templates/DeleteModelForm.html"],
function (declare, _Dialog, communicator, TemplateDirectives, _TemplatedMixin, _DomTemplated, Context, dtl, ddtl, ddrd, renderDialogTemplate, templateString) {
  return declare(_Dialog, {

    show: function (model) {
      var modelType = model.getType()

      var instance = this

      this.inherited("show", arguments, [{
        load: function () {
          $("#mp-dialog-model-title").text()
        },
        submit: function (data) {
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

          model.delete(model, true)
        },
        title: gettext("Confirm delete"),
        contentNode: renderDialogTemplate(templateString, {
          deleteModelQuestion: interpolate(gettext("Do you really want to delete %s?"), [modelType + " - " + model.getTitle()])
        })
      }])
    }
  })
})
