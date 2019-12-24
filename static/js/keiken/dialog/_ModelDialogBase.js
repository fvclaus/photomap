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
          var showSuccessMessage = function () {
            return function () {
              this.showSuccessMessage()
            }.bind(this)
          }.bind(this)
          model
            .onInsert(function () {
              this.showSuccessMessage(data)
              // TODO Why only insert?
              if (collection) {
                collection.insert(model)
              }
            }.bind(this))
            .onUpdate(showSuccessMessage())
            .onDelete(showSuccessMessage())

          assertFunction(options.submit, "Must specify submit function")
          options.submit.call(this, data, function (errorResponse) {
            this.showFailureMessage(errorResponse)
          }.bind(this))
        },
        thisContext: this,
        type: options.type !== undefined ? options.type : this.CONFIRM_DIALOG,
        title: options.title,
        contentNode: renderDialogTemplate(options.templateString, options.templateContext || {})
      }])
    }
  })
})
