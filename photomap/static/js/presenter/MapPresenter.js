/*global $, define, main*/


"use strict";


define(["dojo/_base/declare", "presenter/Presenter", "util/Communicator", "view/MarkerView", "ui/UIState"],
       function (declare, Presenter, communicator, MarkerView, state) {
          return declare(Presenter,  {
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
             /**
              * @public
              * @param {Marker} marker
              */
             triggerClickOnMarker : function (marker) {
                this.view.triggerEventOnMarker(marker, "click");
             },
             /**
              * @public
              * @param {Marker} marker
              */
             triggerDblClickOnMarker : function (marker) {
                this.view.triggerEventOnMarker(marker, "dblclick");
             },
             triggerMouseOverOnMarker : function (marker) {
                this.view.triggerEventOnMarker(marker, "mouseover");
             },
             insertMarker : function (model, open) {
                var marker = this.view.createMarker(model),
                   view = new MarkerView(this.view, marker, model);
                
                communicator.publish("insert:marker", {marker: view.getPresenter(), "open": open});
             },
             getPositionInPixel : function (element) {
                return this.view.getPositionInPixel(element);
             },
             disable : function () {
                this.view.disable();
             },
             enable : function () {
                this.view.enable();
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
                     lat = event.lat,
                     lng = event.lng;

                 communicator.publish("load:dialog", {
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