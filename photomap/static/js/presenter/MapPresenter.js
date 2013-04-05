/*global $, define, main*/


"use strict";


define(["dojo/_base/declare", "presenter/PlacePresenter", "presenter/AlbumPresenter"],
       function (declare, PlacePresenter, AlbumPresenter) {
          return declare(null,  {
             constructor : function () {
                this.placePresenter = new PlacePresenter();
                this.albumPresenter = new AlbumPresenter();
             },
             click : function (event) {
                var instance = this, 
                    state = main.getUI().getState();      

                if (!main.getUI().isDisabled()) {
                   //create new place with description and select it
                   if (!state.isDashboardView()) {
                      instance.placePresenter.insert(event);
                   } else {
                      instance.albumPresenter.insert(event);
                   }
                }
                
             }
          });
       });