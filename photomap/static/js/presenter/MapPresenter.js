/*global $, define, main*/


"use strict";


define(["dojo/_base/declare", "util/Communicator", "view/MarkerView", "ui/UIState"],
       function (declare, communicator, MarkerView, state) {
          return declare(null,  {
             constructor : function (view) {
                this.view = view;
             },
             click : function (event) {

                if (!main.getUI().isDisabled()) {
                   //create new place with description and select it
                   if (!state.isDashboardView()) {
                      this._insert(event, "place");
                   } else {
                      this._insert(event, "album");
                   }
                }
             },
             insertMarker : function (model, open) {
                var marker = this.view.createMarker(model),
                   view = new MarkerView(this.view, marker, model);
                
                communicator.publish("insert:marker", {marker: view.getPresenter(), "open": open});
             },
             insertMarkers : function (models, handler) {
                var instance = this;
                
                if (models.length === 0) {
                   handler.call(instance.view);
                } else {
                   $.each(models, function (index, model) {
                      instance.insertMarker(model, false);
                      if (index === models.length - 1) {
                         handler.call(instance.view);
                      }
                   });
                }
             },
             _insert : function (event, model) {
                 var instance = this,
                     input = main.getUI().getInput(),
                     lat = event.lat,
                     lng = event.lng;

                 input.show({
                    load : function () {
                       $("input[name=lat]").val(lat);
                       $("input[name=lon]").val(lng);
                       if ($("input[name=album]").size() > 0) {
                          $("input[name=album]").val(state.getCurrentLoadedAlbum().id);
                       }
                    },
                    submit : function () {
                       //get name + description
                       var title = $("[name=title]").val(),
                           description = $("[name=description]").val();
                       //dont create yet, server might return error
                       state.store(TEMP_TITLE_KEY, title);
                       state.store(TEMP_DESCRIPTION_KEY, description);
                    },
                    success : function (data) {
                       console.log("insert success");
                       data.lng = lng;
                       data.lat = lat;
                       communicator.publish("insert:" + model, data);
                    },
                    url : "/insert-" + model,
                    context : this
                 });
              }
          });
       });