/*jslint */
/*global $, main, define */

"use strict";

/**
 * @author Frederik Claus
 * @class is stored in a place object, encapsulation of an marker
 */


define(["dojo/_base/declare", "model/Model", "util/ClientState", "ui/UIState"],
       function (declare, Model, clientstate, state) {
          
          return declare(Model ,{
             constructor : function (data, index) {
                
                this.type = 'Photo';
                this.photo = data.photo;
                this.thumb = data.thumb;
                this.order = data.order;
                this.visited = clientstate.isVisitedPhoto(this.id);
             },
             getOrder : function () {
                return this.order;
             },
             setVisited : function (bool) {
                this.visited = bool;
                clientstate.addPhoto(this.id);
             },
             isVisited : function () {
                return this.visited;
             }
          });
       });

