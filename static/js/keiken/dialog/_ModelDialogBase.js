define(["dojo/_base/declare",
  "./Dialog",
  "../util/Communicator",
  "./renderDialogTemplate"],
function (declare, Dialog, communicator, renderDialogTemplate) {
  return declare(Dialog, {

    show: function (options) {
      var model = options.model
      assertSchema({
        model: assertObject,
        title: assertString,
        templateString: assertString,
        submit: assertFunction
      }, options)
      var collection = options.collection
      this.inherited("show", arguments, [{
        submit: function (data) {
          model
            .onSuccess(function (data) {
              this.showSuccessMessage(data)
            }, this)
            .onInsert(function () {
              // TODO Why only insert?
              if (collection) {
                collection.insert(model)
              }
              communicator.publish("inserted:Model")
            })
            .onUpdate(function () {
              communicator.publish("updated:Model", model)
            })
            .onDelete(function () {
              communicator.publish("deleted:Model", model)
            }, this)
            .onFailure(function (data) {
              this.showFailureMessage(data)
            }, this)
            .onError(function () {
              this.showNetworkErrorMessage()
            }, this)

          assertFunction(options.submit, "Must specify submit function")
          options.submit(data)
        },
        context: this,
        type: options.type || this.CONFIRM_DIALOG,
        title: options.title,
        contentNode: renderDialogTemplate(options.templateString, options.context || {})
      }])
    }
  })
})
