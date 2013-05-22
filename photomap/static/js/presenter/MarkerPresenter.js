/*jslint */
/*global $, main, define*/

"use strict";


define(["dojo/_base/declare", "presenter/Presenter", "util/Communicator", "ui/UIState"],
       function (declare, Presenter, communicator, state) {
          return declare(Presenter, {
             getView : function () {
                return this.view;
             },
             getModel : function () {
                return this.model;
             },
             show : function () {
                this.view.show();
             },
             hide : function () {
                this.view.hide();
             },
             mouseOver : function () {
                if (!this.view.isDisabled()) {
                   communicator.publish("mouseover:marker", this);
                }
             },
             mouseOut : function () {
                // hide EditControls after a small timeout, when the EditControls are not entered
                // the EditControls-Box is never seamlessly connected to a place, so we need to give the user some time
                communicator.publish("mouseout:marker");
             },
             dblClick : function () {
                if (!this.view.isDisabled()) {
                  this.switchCurrentLoadedMarker();
                  this.open();
                }
             },
             click : function () {
                
                var instance = this,
                   publish = function () {
                     instance.switchCurrentMarker();
                     communicator.publish('click:marker', instance);
                   };
                
                if (!this.view.isDisabled()) {
                   //timeout necessary to wait if user is actually dblclicking
                   window.setTimeout(publish, 500);
                }
             },
             switchCurrentMarker : function () {
               
               var oldMarker = state.getCurrentMarker();
               
               state.setCurrentMarker(this);
               if (oldMarker) {
                  oldMarker.checkIconStatus();
               }
               this.checkIconStatus();
             },
             switchCurrentLoadedMarker : function () {
               
               var oldMarker = state.getCurrentLoadedMarker();
               
               state.setCurrentLoadedMarker(this);
               if (oldMarker) {
                  oldMarker.checkIconStatus();
               }
               this.checkIconStatus();
             },
             center : function () {
                this.view.center();
             },
             centerAndMoveLeft : function (percentage) {
                this.view.centerAndMove(percentage, "left");
             },
             centerAndMoveRight : function (percentage) {
                this.view.centerAndMove(percentage, "right");
             },
             setCentered : function (centered) {
                this.view.setCentered(centered);
             },
             isCentered : function () {
                return this.view.isCentered();
             },
             update : function () {
                 var model = this.model.getModelType().toLowerCase(),
                     instance = this;

                 communicator.publish("load:dialog", {
                    load : function () {
                       $("input[name=id]").val(instance.model.getId());
                       this.$title = $("input[name=title]").val(instance.model.getTitle());
                       this.$description = $("textarea[name=description]").val(instance.model.getDescription());
                    },
                    submit : function () {
                       //reflect changes locally
                       this._title = this.$title.val();
                       this._description = this.$description.val();
                    },
                    success : function () {
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
                   success : function () {
                      communicator.publish("delete:" + model, instance.model);
                   },
                   url: "/delete-" + model,
                   context : this
                });
             },
             share : function () {
                 var model = this.model.getModelType().toLowerCase(),
                     instance = this;

                 communicator.publish("load:dialog", {
                    url : "/update-album-password",
                    load : function () {
                       $("input[name='album']").val(instance.model.getId());
                       $("input[name='share']").val("http://" + window.location.host + "/album/view/" + instance.model.getSecret() + "-" + instance.model.getId());
                       $("input[name='share']").on("click focus", function () {
                          $(this).select();
                       }).focus();
                       $("#mp-dialog-button-save").button("disable");
                       $("#album-password")
                        .on("keyup keypress", null, function () {
                          if (this.value.length > 0) {
                              $("#mp-dialog-button-save").button("enable");
                           }
                        })
                        .on("keyup", null, "backspace", function () {
                           if (this.value.length === 0) {
                              $("#mp-dialog-button-save").button("disable");
                           }
                        });
                       
                    },
                    context : this
                 });
              },
              checkIconStatus : function () {
                 
                 var visited = true,
                    loadedMarker = state.getCurrentLoadedMarker(),
                    currentMarker = state.getCurrentMarker();
                 
                 if (this.model.getModelType() === "Album") {
                    
                    if (this.isDisabled()) {
                       this.showDisabledIcon();
                    } else if (this === currentMarker) {
                       this.showSelectedIcon();
                    } else {
                       this.showUnselectedIcon();
                    }
                    
                 } else if (this.model.getModelType() === "Place") {
                    
                        
                    this.model.getPhotos().forEach(function (photo) {
                       visited = visited && photo.visited;
                    });
                    
                    if (this.isDisabled()) {
                       this.showDisabledIcon();
                    } else if (this === currentMarker && this !== loadedMarker) {
                       this.showSelectedIcon();
                    } else if (this === loadedMarker) {
                       this.showLoadedIcon();
                    } else if (visited) {
                       this.showVisitedIcon();
                    } else {
                       this.showUnselectedIcon();
                    }
                 }
                 
              },
              setCursor : function (style) {
                 this.view.setCursor(style);
              },
              showVisitedIcon : function () {
                 var markerIcon = (this.model.getModelType() === "Place") ? PLACE_VISITED_ICON : ALBUM_VISITED_ICON;
                 this._showIcon(markerIcon);
              },
              showLoadedIcon : function () {
                 var markerIcon = (this.model.getModelType() === "Place") ? PLACE_LOADED_ICON : ALBUM_LOADED_ICON;
                 this._showIcon(markerIcon);
              },
              showSelectedIcon : function () {
                 var markerIcon = (this.model.getModelType() === "Place") ? PLACE_SELECTED_ICON : ALBUM_SELECTED_ICON;
                 this._showIcon(markerIcon);
              },
              showUnselectedIcon : function () {
                 var markerIcon = (this.model.getModelType() === "Place") ? PLACE_UNSELECTED_ICON : ALBUM_UNSELECTED_ICON;
                 this._showIcon(markerIcon);
              },
              showDisabledIcon : function () {
                 var markerIcon = (this.model.getModelType() === "Place") ? PLACE_DISABLED_ICON : ALBUM_DISABLED_ICON;
                 this._showIcon(markerIcon);
              },
              /**
              * @public
              * @returns {float} Latitude
              */
             getLat : function () {
                return this.model.getLat();
             },
             /**
              * @public
              * @returns {float} Longitude
              */
             getLng : function () {
                return this.model.getLng();
             },
             getLatLng : function () {
                var map = this.view.getMap();
                return map.createLatLng(this.getLat(), this.getLng());
             },
             open : function () {
                
                // switch to albumview if album is opened
                if (this.model.getModelType() === "Album") {
                   
                   window.location.href = '/album/view/' + this.model.getSecret() + '-' + this.model.getId();
                   
                // reset ui and (re)start gallery when place is opened
                } else if (this.model.getModelType() === "Place") {
   
                   communicator.publish("open:place", this.model);
                }
             },
              _showIcon : function (icon) {
                 
                 var markerIsPlace = (this.model.getModelType() === "Place");
                    
                 this.view.setIcon({
                    url : icon,
                    width: markerIsPlace ? PLACE_ICON_WIDTH : ALBUM_ICON_WIDTH,
                    height: markerIsPlace ? PLACE_ICON_HEIGHT : ALBUM_ICON_HEIGHT
                 });
              }
          });
       });
