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
                this.title = data.title;
                this.description = (data.description === "")? null : data.description;
                this.id = data.id;
                this.order = data.order;
                this.visited = clientstate.isVisitedPhoto(this.id);
             },
             getTitle : function () {
                return this.title;
             },
             getDescription : function () {
                return this.description;
             },
             setTitle : function (title) {
                this.title = title;
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
              * @returns {Integer} Id of this model
              */
             getId : function () {
                return this.id;
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

