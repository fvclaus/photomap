/*global $, define, main*/


"use strict";


define(["dojo/_base/declare", "util/Communicator", "ui/UIState"],
       function (declare, communicator, state) {
          return declare(null,  {
             constructor : function (view) {
                this.view = view;
             },
             click : function (event) {

                if (!main.getUI().isDisabled()) {
                   //create new place with description and select it
                   if (!.isDashboardView()) {
                      this._insert(event, "place");
                   } else {
                      this._insert(event, "album");
                   }
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