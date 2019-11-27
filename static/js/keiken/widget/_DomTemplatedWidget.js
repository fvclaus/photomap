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
  "dojox/dtl/_base",
  "../view/View",
  "./loadDtlDirectives!",
  "dojo/domReady!"],
function (declare, _WidgetBase, _AttachMixin, _DomTemplated, ddcd, dd, View) {
  return declare([View, _WidgetBase, _DomTemplated, _AttachMixin], {
    widgetsInTemplate: true,
    /*
     * @public
     * @description Widgets must expose a certain number of function. The constructor will check if they have been defined in the child class.
     */
    constructor: function (params, srcNodeRef) {
      assertString(this.viewName, "Every PhotoWidget must define a viewName")
      assertString(this.templateString, "Every PhotoWidget must define a templateString.")
      var $children = $(srcNodeRef)
        .children()
        .detach()
        .removeClass("mp-cloak")
      if ($children.length > 0) {
        this.children = $children.get(0)
        this.children.safe = true
      }
    },
    /*
     * @public
     * @description Part of the dijit widget lifecycle. Gets called before the dom is ready. Converts the standard dom element attach points to jquery element attach points. Declare your selectors with data-dojo-attach-point=exampleNode to access them as this.$example after buildRendering().
     * The dijit domNode member will be converted to $container. $container will be the root element of your widget.
     */
    buildRendering: function () {
      this.inherited(this.buildRendering, arguments)
      if (this.children && this.containerNode) {
        $(this.containerNode).append(this.children)
      }
      this._attachChildContainers()
      this._wireJQueryElements()
      this._wireWidgetInTemplateInstances()
    },
    /**
      * See _attachChildContainers for detailed explanation
      * Prevent _AttachMixin from attaching to elements of descendant widget.
      */
    // eslint-disable-next-line no-unused-vars
    _processTemplateNode: function (baseNode, getAttrFunc, attachFunc) {
      var widgetid = getAttrFunc(baseNode, "widgetid")
      if (widgetid && widgetid !== this.id) {
        return false
      } else {
        return this.inherited(this._processTemplateNode, arguments)
      }
    },
    _removeContainerNodeAttachPoint: function (el) {
      el.childNodes.forEach(function (child) {
        if (child.getAttribute && child.getAttribute("data-dojo-attach-point") === "containerNode") {
          child.removeAttribute("data-dojo-attach-point")
        }
        this._removeContainerNodeAttachPoint(child)
      }.bind(this))
    },
    _isUnattachedContainerNode: function (attachNode, domNode) {
      var isContainerNode = attachNode._keys.indexOf("containerNode") !== -1
      var isUnattachedNode = !domNode.hasAttribute("data-container-node-attached")
      return isContainerNode && isUnattachedNode
    },
    _attachChildContainer: function (childWidgetInstance) {
      var currentDomNode
      childWidgetInstance.template.nodelist.contents.forEach(function (renderNode) {
        if (renderNode.constructor === dd._DomNode) {
          currentDomNode = renderNode.contents
        } else if (renderNode.constructor === ddcd.AttachNode &&
          this._isUnattachedContainerNode(renderNode, currentDomNode)) {
          currentDomNode.childNodes.forEach(function (childNode) {
            this._attachTemplateNodes(childNode)
          }.bind(this))
          currentDomNode.setAttribute("data-container-node-attached", true)
        }
      }.bind(this))
    },
    /**
      * Attach dojo-attach-event and dojo-attach-point of elements inside
      * containerNodes of immediate descendants of this widget:
      * <div>
      *  <div data-dojo-type="otherWidget">
      *    <span data-dojo-attach-point="myAttachPoint" />
      *  </div>
      * </div>
      * In the above example the myAttachPoint should not be attached to the otherWidget instance,
      * but to the enclosing widget instance.
      * AFAIK This is not supported by dojo. dojo will attach myAttachPoint to all ancestors of otherWidget.
      * This is not really relevant for attach-points, but breaks attach-events bind listeners to the dom.
      * This method only works with the overwritten _processTemplateNode function.
      */
    _attachChildContainers: function () {
      this._findTypeNodes(this.template)
        .forEach(function (typeNode) {
          this._attachChildContainer(typeNode._dijit)
        }.bind(this))
    },
    _wireJQueryElements: function () {
      this._attachPoints.forEach(function (attachPoint) {
        this["$" + attachPoint.replace("Node", "")] = $(this[attachPoint])
      }.bind(this))
      this.$container = $(this.domNode)
    },
    _wireWidgetInTemplateInstances: function () {
      this._findTypeNodes(this.template)
        .forEach(function (node) {
          var instanceName = node._node.getAttribute("data-widget-instance-name")
          if (instanceName) {
            this[instanceName] = node._dijit
          }
        }.bind(this))
    },
    _findTypeNodes: function (template) {
      return template.nodelist.contents
        .filter(function (node) {
          return node.constructor === ddcd.DojoTypeNode
        })
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
