// "use strict" does not work with multiple inherited() calls

/**
 * @author Frederik Claus
 * @description Base class for all widgets. It defines and enforces certain API conventions that all widgets must follow.
*/
define(["dojo/_base/declare",
  "dijit/_WidgetBase",
  "dijit/_AttachMixin",
  "dojox/dtl/_DomTemplated",
  "dojox/dtl/contrib/dijit",
  "../view/View",
  "./loadDtlDirectives!",
  "dojo/domReady!"],
function (declare, _WidgetBase, _AttachMixin, _DomTemplated, ddcd, View) {
  return declare([View, _WidgetBase, _DomTemplated, _AttachMixin], {
    widgetsInTemplate: true,
    /*
     * @public
     * @description Widgets must expose a certain number of function. The constructor will check if they have been defined in the child class.
     */
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
      this.inherited(this.buildRendering, arguments)
      this._wireJQueryElements()
      this._wireWidgetInTemplateInstances()
    },
    _wireJQueryElements: function () {
      this._attachPoints.forEach(function (attachPoint) {
        this["$" + attachPoint.replace("Node", "")] = $(this[attachPoint])
      }.bind(this))
      this.$container = $(this.domNode)
    },
    _wireWidgetInTemplateInstances: function () {
      this.template.nodelist.contents
        .filter(function (node) {
          return node.constructor === ddcd.DojoTypeNode
        })
        .forEach(function (node) {
          var instanceName = node._node.getAttribute("data-widget-instance-name")
          if (instanceName) {
            this[instanceName] = node._dijit
          }
        }.bind(this))
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
      // Use this widget with the keyboard.
      this._bindListener && this._bindListener()
    },
    /**
      * @description Widgets must bind all their Listeners in this function. It will be called upon startup.
      */
    _bindListener: null,
    destroy: function () {
      this.inherited(arguments)
      this._unbindListener && this._unbindListener()
    },
    /**
      * @desription Widgets must unbind all their listeners in this function. It will be called upon destruction.
      */
    _unbindListener: null
  })
})
