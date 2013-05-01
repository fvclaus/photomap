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
             constructor : function (view, model) {
                this.view = view || null;
                this.model = model || null;
             }
          });
       });
