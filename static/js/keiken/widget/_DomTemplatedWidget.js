// "use strict" does not work with multiple inherited() calls

/**
 * @author Frederik Claus
 * @description Base class for all widgets. It defines and enforces certain API conventions that all widgets must follow.
*/
define(["dojo/_base/declare",
  "dojo/_base/lang",
  "dijit/_WidgetBase",
  "dojox/dtl/_DomTemplated",
  "dojox/dtl/contrib/dijit",
  "dojox/dtl/_base",
  "dojo/on",
  "../view/View",
  "./loadDtlDirectives!",
  "dojo/domReady!"],
function (declare, lang, _WidgetBase, _DomTemplated, ddcd, dd, on, View) {
  ddcd.AttachNode = declare(ddcd.AttachNode, {
    render: function (context, buffer) {
      if (!this.rendered) {
        this._keys.forEach(function (key) {
          context.getThis()["$" + key.replace("Node", "")] = $(this._object || buffer.getParent())
        })
      }
      return this.inherited(this.render, arguments)
    }
  })

  ddcd.DojoTypeNode = declare(ddcd.DojoTypeNode, {
    constructor: function (node) {
      this._instanceName = node.getAttribute("data-widget-instance-name")
    },
    render: function (context, buffer) {
      buffer = this.inherited(this.render, arguments)
      if (this._instanceName) {
        context.getThis()[this._instanceName] = this._dijit
      }
      return buffer
    }
  })

  /**
    * Patch addEvent function of DomBuffer.
    * It uses dojo/on which uses dojo/mouse to map mouseenter and mouseleave events to mouseover and mouseout.
    * This was done to make all browsers compatible with IE.
    */
  dd.DomBuffer = declare(dd.DomBuffer, {
    addEvent: function (context, type, fn, /* Array|Function */ args) {
      if (!context.getThis()) { throw new Error("You must use Context.setObject(instance)") }
      this.onAddEvent && this.onAddEvent(this.getParent(), type, fn)
      var resolved = fn
      if (lang.isArray(args)) {
        resolved = function (e) {
          this[fn].apply(this, [e].concat(args))
        }
      }
      return on(this.getParent(), type.replace(/^on/, "").toLowerCase(), lang.hitch(context.getThis(), resolved))
    }
  })

  return declare([View, _WidgetBase, _DomTemplated], {
    widgetsInTemplate: true,
    // eslint-disable-next-line no-unused-vars
    constructor: function (params, srcNodeRef) {
      assertString(this.viewName, "Every PhotoWidget must define a viewName")
      assertString(this.templateString, "Every PhotoWidget must define a templateString.")
      this.$children = $(srcNodeRef)
        .children()
        .detach()
        .removeClass("mp-cloak")
    },
    /*
     * @public
     * @description Part of the dijit widget lifecycle. Gets called before the dom is ready. Converts the standard dom element attach points to jquery element attach points. Declare your selectors with data-dojo-attach-point=exampleNode to access them as this.$example after buildRendering().
     * The dijit domNode member will be converted to $container. $container will be the root element of your widget.
     */
    buildRendering: function () {
      this.inherited(this.buildRendering, arguments)
      this.$domNode = $(this.domNode)
      this.$container = this.$domNode
      // containerNode is used for this exact purpose in _TemplatedMixin._fillContent()
      if (this.$children && this.containerNode) {
        $(this.containerNode).append(this.$children)
      }
      this._attachChildContainers2()
    },
    /**
      * Attach dojo-attach-event and dojo-attach-point of elements inside
      * containerNodes of immediate children of this widget:
      * <div>
      *  <div data-dojo-type="otherWidget">
      *    <span data-dojo-attach-point="myAttachPoint" />
      *  </div>
      * </div>
      * In the above example the myAttachPoint should not be attached to the otherWidget instance,
      * but to the enclosing widget instance.
      * AFAIK This is not supported by dojo. _AttachMixin will ignore everything in a containerNode.
      * There will also be no Attach- or EventNode because the node list only contains nodes that belong this this widget.
      */
    _attachChildContainers2: function () {
      this._findTypeNodes(this.template)
        .forEach(function (typeNode) {
          var $children = typeNode._dijit.$children
          if ($children && $children.length > 0) {
            var template = new dd.DomTemplate($children.get(0))

            this._render.render(this._getContext(), template)
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
