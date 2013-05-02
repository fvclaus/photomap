/*jslint */
/*global */

"use strict";

/**
 * @author Marc-Leon Römer
 * @class Base class for all Presenter
 */

define(["dojo/_base/declare"],
       function (declare) {
          return declare(null, {
             constructor : function () {
                this.presenter = null;
                
                this.disabled = false;
             },
             setDisabled : function (bool) {
                this.disabled = bool;
             },
             isDisabled : function () {
                return this.disabled;
             },
             getPresenter : function () {
                return this.presenter;
             }
          });
       });
