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
                this.visited = clientstate.isVisitedPhoto(this);
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
             setVisited : function (visited) {
                this.visited = visited;
                if (visited) {
                  clientstate.insertVisitedPhoto(this);
                }
             },
             isVisited : function () {
                return this.visited;
             }
          });
       });

