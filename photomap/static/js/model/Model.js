/*jslint */
/*global $, define, main */

"use strict";

/**
 * @author Marc-Leon Römer
 * @class Base class for all models
 */

define(["dojo/_base/declare"],
       function (declare) {
          
          return declare(null,  {
             constructor : function (data) {
                
                this.type = data.type;
                this.title = data.title;
                this.id = data.id;
                // reading from input elements will return '' if nothing has been entered
                this.description = (data.description === "")? null : data.description;
             },
             getTitle : function () {
                return this.title;
             },
             setTitle : function (title) {
                this.title = title;
             },
             getDescription : function () {
                return this.description;
             },
             setDescription : function (description) {
                this.description = description;
             },
             /**
              * @public
              * @returns {String} Name of this model
              */
             getModelType : function () {
                return this.type;
             },
             /**
              * @public
              * @returns {Number} Id of this model
              */
             getId : function () {
                return this.id;
             },
             equals : function (other) {
                //TODO how does the instanceof check work with Dojo?
                if (other instanceof this.constructor) {
                   return other.id === this.id;
                } else {
                   return false;
                }
             }
          });
       });

