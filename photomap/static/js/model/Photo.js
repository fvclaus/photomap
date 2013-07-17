/*jslint */
/*global $, main, define */

"use strict";

/**
 * @author Frederik Claus
 * @class is stored in a place object, encapsulation of an marker
 */


define(["dojo/_base/declare", 
        "model/Model"],
       function (declare, Model) {
          
          return declare(Model ,{
             constructor : function (data, index) {
                
                this.type = 'Photo';
                this.photo = data.photo;
                this.thumb = data.thumb;
                this.order = data.order;
                this.visited = data.visited;
             },
             getOrder : function () {
                return this.order;
             },
             getPhoto : function () {
                return this.photo;
             },
             getThumb : function () {
                return this.thumb;
             },
             getSource : function (srcPropertyName) {
                if (!this[srcPropertyName]) {
                   throw new Error("UnknownPropertyError : " + srcPropertyName);
                }
                return this[srcPropertyName];
             },
             setVisited : function (visited) {
                this.visited = visited;
             },
             isVisited : function () {
                return this.visited;
             }
          });
       });

