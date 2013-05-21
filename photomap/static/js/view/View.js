/*jslint */
/*global */

"use strict";

/**
 * @author Marc-Leon Römer
 * @class Base class for all Presenter
 */

define(["dojo/_base/declare", "util/Communicator"],
       function (declare, communicator) {
          return declare(null, {
             constructor : function () {
                this.presenter = null;
                this.$container = null; // every View that represents a DOM element has to specify the container-element 
                this.viewName = "View"; // the viewName method is just for convenience, still every View that represents a DOM element should specify the viewName property
                
                this.disabled = false;
                this.active = false;
                
                /* every View that represents a DOM element has to call the following method with the given params
                 * this._bindActivationListener(this.$container, this.viewName);
                 * this will make sure that the view representing the currently focused element is 'active'
                 * especially needed for keyboard events
                 */
             },
             getName : function () {
                return this.viewName;
             },
             setDisabled : function (disabled) {
                this.disabled = disabled;
             },
             isDisabled : function () {
                return this.disabled;
             },
             setActive : function (active) {
                this.active = active;
             },
             isActive : function () {
                return this.active;
             },
             getPresenter : function () {
                return this.presenter;
             },
             _bindActivationListener: function ($container, view) {
                var instance = this;
                $container.on({
                   "click.ActivateView, focus.ActivateView": function () {
                     communicator.publish("activate:view", view);
                     console.log(view + " is now active.");
                   }
               });
             }
          });
       });
