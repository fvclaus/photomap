/*jslint */
/*global $, main, define */

"use strict";

/**
 * @author Frederik Claus
 * @class is stored in a place object, encapsulation of an marker
 */


define(["dojo/_base/declare", "model/InfoMarker", "util/ClientState", "ui/UIState"],
       function (declare, InfoMarker, clientstate, state) {
          
          return declare(null ,{
             constructor : function (data, index) {
                
                this.model = 'Photo';
                this.photo = data.photo;
                this.thumb = data.thumb;
                this.title = data.title;
                this.description = (data.description === "")? null : data.description;
                this.id = data.id;
                this.order = data.order;
                this.visited = clientstate.isVisitedPhoto(this.id);
             },
             getModel : function () {
                return this.model;
             },
             checkBorder : function () {
                //need reselection because anchors change
                if (this.visited) {
                   $("img[src='" + this.thumb + "']").addClass("visited");
                }
             },
             showBorder : function (bool) {
                this.visited = bool;
                clientstate.addPhoto(this.id);
                this.checkBorder();
             },
             triggerClick : function () {
                this.openPhoto();
             },
             openPhoto : function () {
                state.setCurrentLoadedPhoto(this);
                //TODO events?
                var instance = this; 

                main.getUI().getGallery().triggerClickOnPhoto(instance);
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

