// "use strict" does not work with multiple inherited() calls

/**
 * @author Frederik Claus
 * @description Base class for all widgets. It defines and enforces certain API conventions that all widgets must follow.
*/
define(["dojo/_base/declare",
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  "../view/View",
  "dojo/domReady!"],
function (declare, _WidgetBase, _TemplatedMixin, View) {
  return declare([View, _WidgetBase, _TemplatedMixin], {
    /*
     * @public
     * @description Widgets must expose a certain number of function. The constructor will check if they have been defined in the child class.
     */
    // eslint-disable-next-line no-unused-vars
    constructor: function (params, srcNodeRef) {
      assertString(this.viewName, "Every PhotoWidget must define a viewName")
      assertString(this.templateString, "Every PhotoWidget must define a templateString.")
    },
    /*
     * @public
     * @description Part of the dijit widget lifecycle. Gets called before the dom is ready. Converts the standard dom element attach points to jquery element attach points. Declare your selectors with data-dojo-attach-point=exampleNode to access them as this.$example after buildRendering().
     * The dijit domNode member will be converted to $container. $container will be the root element of your widget.
     */
    buildRendering: function () {
      this.inherited(arguments)
      var instance = this
      this._attachPoints.forEach(function (attachPoint) {
        var jQSelectorName = "$" + attachPoint.replace("Node", "")
        instance[jQSelectorName] = $(instance[attachPoint])
      })
      this.$container = $(this.domNode)
    },
    /*
     * @public
     * @description Part of the dijit widget lifecycle. This must be called by hand. The dom is already present. Every PhotoWidget must at least define _carouselOptions and _srcPropertyName by the time this startup function is called.
     * @idempotent
     */
    startup: function () {
      if (this._started) {
        return
      }
      this.inherited(arguments)
      if (this._bindListener) {
        this._bindListener()
      }
    },
    _bindListener: null,
    destroy: function () {
      this.inherited(arguments)
      if (this._unbindListener) {
        this._unbindListener()
      }
    },
    _unbindListener: null
  })
})
