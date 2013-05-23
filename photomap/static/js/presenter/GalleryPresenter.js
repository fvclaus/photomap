/*jslint */ 
/*global $, define, main, DASHBOARD_VIEW, ALBUM_VIEW */

"use strict";

define(["dojo/_base/declare", "presenter/Presenter", "util/Communicator", "ui/UIState"],
       function (declare, Presenter, communicator, state) {
          return declare(Presenter, {
             init : function () {
                this.view.init();
             },
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
             click : function (photo) {
                if (!this.view.isDisabled()) {
                  communicator.publish("click:galleryThumb", photo);
                }
             },
             checkSlider : function () {
                this.view.checkSlider();
             },
             insertPhoto : function (photo) {
                this.view.insertPhoto(photo);
             },
             deletePhoto : function (photo) {
                this.view.deletePhoto(photo);
             },
             placeDeleteReset : function (place) {
                this.view.placeDeleteReset(place);
             },
             restart : function (photos) {
                this.view.getCarousel().update(photos);
             },
             start : function (photos) {
                this.view.start(photos);
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
                    place = state.getCurrentLoadedPlace().getModel();

                // if-clause to prevent method from being executed if there are no places yet
                if (state.getPlaces().length !== 0) {
                   communicator.publish("load:dialog", {
                      load : function () {
                         var input = this;
                         console.log(this);
                         $("#insert-photo-tabs").tabs();
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
                      url : "/insert-photo"
                   });
                }
             },
             update : function () {
                var model = this.model.getModelType().toLowerCase(),
                    instance = this;

                communicator.publish("load:dialog", {
                   load : function () {
                      //prefill with values from selected picture
                      $("input[name=id]").val(instance.model.getId());
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
                      communicator.publish("change:" + model, instance.model);
                   },
                   url : "/update-" + model,
                   context : this
                });
             },
             "delete" : function () {
                var model = this.model.getModelType().toLowerCase(),
                    instance = this;
                    
                communicator.publish("load:dialog", {
                   type : CONFIRM_DIALOG,
                   load : function () {
                      $("input[name='id']").val(instance.model.getId());
                      $("span#mp-dialog-" + model + "-title").text("'" + instance.model.getTitle() + "'?");
                   },
                   success : function (data) {
                      communicator.publish("delete:" + model, instance.model);
                   },
                   url: "/delete-" + model,
                   context : this
                });
             }
             
          });
       });
