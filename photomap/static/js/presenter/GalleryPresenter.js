/*jslint */ 
/*global $, define, assertNotNull, main, DASHBOARD_VIEW, ALBUM_VIEW */

"use strict";

define(["dojo/_base/declare", "presenter/Presenter", "util/Communicator", "ui/UIState"],
       function (declare, Presenter, communicator, state) {
          return declare(Presenter, {
             isStarted : function () {
                return this.view.isStarted();
             },

             /*
              * @view
              * @description Reacts to a click on one of the gallery thumbs."
              * @param {Photo} photo
              */
             click : function (photo) {
                assertNotNull(photo);
                if (!this.view.isDisabled()) {
                  communicator.publish("click:galleryThumb", photo);
                }
             },
             navigateIfNecessary : function (photo) {
                this.view.navigateIfNecessary(photo);
             },
             insertPhoto : function (photo) {
                this.view.insertPhoto(photo);
             },
             deletePhoto : function (photo) {
                this.view.deletePhoto(photo);
             },
             restart : function (photos) {
                this.view.restart(photos);
             },
             load : function (photos) {
                this.view.load(photos);
             },
             start : function () {
                this.view.start();
             },
             reset : function () {
                this.view.reset();
             },
             triggerClickOnPhoto : function () {
               this.view.triggerClickOnPhoto(); 
             },
             setPhotoVisited : function (photo) {
                this.view.setPhotoVisited(photo);
             },
             update : function () {
                var modelName = this.model.getModelType().toLowerCase(),
                    id = this.model.getId(),
                    instance = this,
                    requestUrl = "/" + modelName + "/" + id + "/",
                    dialogUrl = "/dialog/update/photo";

                communicator.publish("load:dialog", {
                   load : function () {
                      $("form[name='update-" + modelName + "']").attr("action", requestUrl);
                      //prefill with values from selected picture
                      $("input[name=order]").val(instance.model.getOrder());
                      this.$title = $("input[name=title]").val(instance.model.getTitle());
                      this.$description = $("textarea[name=description]").val(instance.model.getDescription());
                   },
                   submit : function () {
                      //store them
                      this._title = this.$title.val();
                      this._description = this.$description.val();
                   },
                   success : function (data) {
                      instance.model.setTitle(this._title);
                      instance.model.setDescription(this._description);
                      communicator.publish("change:" + modelName, instance.model);
                   },
                   url : dialogUrl,
                   context : this
                });
             },
             "delete" : function () {
                var modelName = this.model.getModelType().toLowerCase(),
                    id = this.model.getId(),
                    instance = this,
                    requestUrl = "/" + modelName + "/" + id + "/",
                    dialogUrl = "/dialog/delete/photo";
                    
                communicator.publish("load:dialog", {
                   type : CONFIRM_DIALOG,
                   load : function () {
                      $("form[name='delete-" + modelName + "']").attr("action", requestUrl);
                      $("span#mp-dialog-" + modelName + "-title").text("'" + instance.model.getTitle() + "'?");
                   },
                   success : function (data) {
                      communicator.publish("delete:" + modelName, instance.model);
                   },
                   url: dialogUrl,
                   context : this
                });
             }
             
          });
       });
