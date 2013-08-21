/*jslint */
/*global define*/

"use strict";

/**
 * @author Marc-Leon Römer
 * @class Base class for all Views.
 * It provides a few shortcuts for checking the status of the view (disabled/enabled) and to check whether or not the view is active.
 * For the View implementation this.disabled and this.active should be used.
 */

define(["dojo/_base/declare",
        "../util/Communicator"],
       function (declare, communicator) {
          return declare(null, {
             constructor : function () {
                this.presenter = null;
                this.$container = null; // every View that represents a DOM element has to specify the container-element 
                
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
             /*
              * @presenter
              * @description Views can query their status using the this.disabled variable.
              */
             setDisabled : function (disabled) {
                this.disabled = disabled;
             },
             /*
              * @presenter
              * @description Presenter should use this to query the status of their views.
              */
             isDisabled : function () {
                return this.disabled;
             },
             /*
              * @presenter
              * @description Will be used upon setDisabled(true). Overwrite if needed.
              */
             disable : function () {
                return false;
             },
             /*
              * @presenter
              * @description Will be used upon setDisabled(false). Overwrite if needed.
              */
             enable : function () {
                return false;
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
