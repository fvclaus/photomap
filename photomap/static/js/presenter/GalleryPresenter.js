/*jslint */ 
/*global $, define, assertNotNull, main, DASHBOARD_VIEW, ALBUM_VIEW */

"use strict";

define(["dojo/_base/declare", "presenter/Presenter", "util/Communicator", "ui/UIState"],
       function (declare, Presenter, communicator, state) {
          return declare(Presenter, {
             isStarted : function () {
                return this.view.isStarted();
             },
             mouseEnter : function ($el, photo) {
                this.model = photo;
                if (!this.view.isDisabled()) {
                  communicator.publish("mouseenter:galleryThumb", {context: this, element: $el});
                }
             },
             mouseLeave : function () {
                communicator.publish("mouseleave:galleryThumb");
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
             insert : function () {
                var instance = this,
                    place = state.getCurrentLoadedPlace().getModel(),
                    requestUrl = "/photo/",
                    dialogUrl = "/dialog/insert/photo";

                // if-clause to prevent method from being executed if there are no places yet
                if (state.getPlaces().length !== 0) {
                   communicator.publish("load:dialog", {
                      load : function () {
                         var input = this;
                         console.log(this);
                         $("#insert-photo-tabs").tabs();
                         $("form[name='insert-photo']").attr("action", requestUrl);
                         $("input[name='place']").val(place.getId());
                         this.$title = $("input[name='title']");
                         this.$description = $("textarea[name='description']");
                         //start the editor
                         $("#file-input").bind('change', function (event) {
                            input.editor.edit.call(input.editor, event);
                         });
                      },
                      submit: function () {
                         state.store(TEMP_TITLE_KEY, this.$title.val());
                         state.store(TEMP_DESCRIPTION_KEY, this.$description.val());
                      },
                      data : function () {
                         var data = new FormData();
                         data.append('place', place.getId());
                         data.append('title', this.$title.val());
                         data.append('description', this.$description.val());
                         data.append("photo", this.editor.getAsFile());

                         return data;
                      },
                      success : function (data) {
                         communicator.publish("insert:photo", data);
                      },
                      url : dialogUrl
                   });
                }
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
