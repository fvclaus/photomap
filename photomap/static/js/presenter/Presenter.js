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
             constructor : function (view, model) {
                this.view = view || null;
                this.model = model || null;
             },
             setDisabled : function (disable) {
                assertTrue(disable !== undefined, "disable mustn't be undefined");
                
                console.log(this.view.getName() + " setDisabled: " + disable);
                
                this.view.setDisabled(disable);
                
                if (!disable && this.view.enable) {
                   this.view.enable();
                } else if (disable && this.view.disable) {
                   this.view.disable();
                }
             },
             isDisabled : function () {
                return this.view.isDisabled();
             },
             setActive : function (active) {
                assertTrue(active !== undefined, "active mustn't be undefined");
                
                this.view.setActive(active);
             },
             isActive : function () {
                return this.view.isActive();
             }
          });
       });
