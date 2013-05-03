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
                  this.open();
                }
             },
             click : function () {
                
                var instance = this,
                    publish = function () {
                       communicator.publish('click:marker', instance);
                       };
                
                if (!this.view.isDisabled()) {
                   if (state.isDashboardView()) {
                      state.setCurrentAlbum(this.model);
                      state.setCurrentLoadedAlbum(this.model);
                   } else if (state.isAlbumView()) {
                      state.setCurrentPlace(this.model);
                   }
                   //timeout necessary to wait if user is actually dblclicking
                   window.setTimeout(publish, 500);
                }
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
                       // $("input[name='share']").val(
                       // copy to clipboard with jquery (zclip) using ZeroClipboard (javascript and flash)
                       $("#mp-copy-share").zclip({
                          path: 'static/js/zeroclipboard/zeroclipboard.swf',
                          copy: $("input[name='share']").val()
                       });
                    },
                    context : this
                 });
              },
              checkIconStatus : function () {
                 
                 if (this.model.getModelType() === "Album") {
                    
                    this.showVisitedIcon();
                    
                 } else if (this.model.getModelType() === "Place") {
                    
                    var visited = true;
                    this.model.getPhotos().forEach(function (photo) {
                       visited = visited && photo.visited;
                    });
    
                    if (state.getCurrentLoadedPlace() === this) {
                       this.showSelectedIcon();
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
                 this.view.setOption({icon: PLACE_VISITED_ICON});
              },
              showSelectedIcon : function () {
                 this.view.setOption({icon: PLACE_SELECTED_ICON});
              },
              showUnselectedIcon : function () {
                 this.view.setOption({icon: PLACE_UNSELECTED_ICON});
              },
              showDisabledIcon : function () {
                 this.view.setOption({icon: PLACE_DISABLED_ICON});
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
                    
                   var oldPlace = state.getCurrentLoadedPlace();
                   
                   state.setCurrentPlace(this.model);
                   state.setCurrentLoadedPlace(this.model);
                   
                   //TODO checkIconStatus has to be modified to work with views instead of models..
                   // change icon of new place
                   //this.checkIconStatus();
                   // change icon of old place
                   if (oldPlace) {
                      //oldPlace.checkIconStatus();
                   }
   
                   communicator.publish("open:place", this.model);
                }
             }
          });
       });
