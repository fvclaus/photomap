/*jslint */ 
/*global $, define, main, DASHBOARD_VIEW, ALBUM_VIEW */

"use strict";

define(["dojo/_base/declare", "util/Communicator"],
       function (declare, communicator) {
          return declare(null, {
             constructor : function (view) {
                
                this.view = view;
                
             },
             init : function () {
                this.view.init();
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
             start : function (photos) {
                this.view.start(photos);
             },
             reset : function () {
                this.view.reset();
             },
             insert : function () {
                var instance = this,
                    input = main.getUI().getInput(),
                    place = state.getCurrentLoadedPlace();

                // if-clause to prevent method from being executed if there are no places yet
                if (state.getPlaces().length !== 0) {
                   input.show({
                      load : function () {      
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
                         data.append("photo", input.editor.getAsFile());

                         return data;
                      },
                      success : function (data) {
                         communicator.publish("insert:photo", data);
                      },
                      url : "/insert-photo",
                      context : this
                   });
                }
             },
             update : function (photo) {
                var input = main.getUI().getInput();

                input.show({
                   load : function () {
                      //prefill with values from selected picture
                      $("input[name=id]").val(photo.getId());
                      $("input[name=order]").val(photo.order);
                      this.$title = $("input[name=title]").val(photo.getTitle());
                      this.$description = $("textarea[name=description]").val(photo.description);
                   },
                   submit : function () {
                      //store them
                      this._title = this.$title.val();
                      this._description = this.$description.val();
                   },
                   success : function (data) {
                      photo.setTitle(this._title);
                      photo.setDescription(this._description);
                      communicator.publish("change:photo", photo);
                   },
                   url : "/update-photo",
                   context : this
                });
             },
             "delete" : function (photo) {
                var input = main.getUI().getInput();
                input.show({
                   type : CONFIRM_DIALOG,
                   load : function () {
                      $("input[name='id']").val(photo.getId());
                      $("span#mp-dialog-photo-title").text("'" + photo.getTitle() + "'?");
                   },
                   success : function (data) {
                      communicator.publish("delete:photo", photo);
                   },
                   url: "/delete-photo",
                   context : this
                });
             }
             
          });
       });
