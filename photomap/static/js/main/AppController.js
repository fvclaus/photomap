/*jslint */
/*global $, define, main, init, initTest, finalizeInit, assertTrue, gettext */

"use strict";

/**
 * @author Frederik Claus, Marc-Leon Roemer
 * @class Controls communication in between the classes of KEIKEN
 */

define(["dojo/_base/declare", "util/Communicator", "ui/UIState", "model/Album", "model/Collection", "util/ClientState", "util/InfoText"], 
       function (declare, communicator, state, Album, Collection, clientstate, InfoText) {
          return declare(null, {
             
             constructor : function () {
                // Instantiate an infotext in case user needs to be informed about sth (use this.infotext.alert(message) for that)
                this.infoText = new InfoText();

                communicator.subscribeOnce("init", this._init);
                communicator.subscribe("load:dialog", this._dialogLoad);
                communicator.subscribe({
                   "enable:ui": this._uiEnable,
                   "disable:ui": this._uiDisable
                }, this);
                communicator.subscribe("activate:view", this._viewActivation);
                
                communicator.subscribe({
                   "mouseover:marker": this._markerMouseover,
                   "mouseout:marker": this._markerMouseout,
                   //"click:marker": this._markerClick, // @see AppRouter.js
                   "insert:marker": this._markerInsert,
                   "insert:markersInitialInsert": {
                      handler: this._markerInitialInsert,
                      context: this,
                      counter: 1
                   },
                   "centered:marker": this._markerCentered
                });

                
                communicator.subscribe("change:photo change:place change:album", this._modelUpdate);
                communicator.subscribe("delete:photo delete:place delete:album", this._modelDelete);
                communicator.subscribe("processed:album processed:place processed:photo", this._modelInsert);
                
                communicator.subscribe("change:usedSpace", this._usedSpaceUpdate);
                communicator.subscribe("change:mapCenter", this._mapCenterChanged);
                //communicator.subscribe("close:detail", this._detailClose); handled in AppRouter now
                
                communicator.subscribe("change:AppState", this._handleAppStateChanges, this);
                
                if (state.isAlbumView()) {
                   
                   communicator.subscribe({
                      "mouseleave:galleryThumb": this._galleryThumbMouseleave,
                      //"click:galleryThumb": this._galleryThumbClick handled in AppRouter now
                   });
                   
                   communicator.subscribe({
                      "beforeLoad:slideshow": this._slideshowBeforeLoad,
                      "update:slideshow": this._slideshowUpdate,
                      "click:slideshowImage": this._slideshowClick
                   });
                   
                   communicator.subscribe("navigate:fullscreen", this._fullscreenNavigate);
                   
                   //communicator.subscribe("called:openPlace", this._placeOpen); now "dblClick:place" -> handled in AppRouter
                   
                   communicator.subscribe("change:photoOrder", this._photoOrderChange);
                   communicator.subscribe("visited:photo", this._photoVisited);
                   communicator.subscribe("click:pageTitle", this._updatePageTitle);
                   communicator.subscribe("clicked:GalleryOpenButton", function () {
                      main.getUI().getAdminGallery().run();
                   });
                   communicator.subscribe("hover:GalleryPhoto", function (data) {
                      state.setCurrentPhoto(data.photo);
                      main.getUI().getControls().showPhotoControls(data);
                   });
                }
             },
             /*
              * --------------------------------------------------
              * Handler: 
              * --------------------------------------------------
              */
             _init : function (data) {
                console.dir(data);
                if (state.isAlbumView()) {
                   main.getUI().getInformation().update(data);
                   main.getUI().getPageTitleWidget().update(data.getTitle());
                   state.setAlbum(data);
                   state.setPlaceCollection(data.places);
                } else {
                   state.setAlbumCollection(new Collection(data, {
                      modelConstructor: Album,
                      modelType: "Album"
                   }));
                }
                main.getUI().getControls().init();
                clientstate.init();
                main.getMap().init(data);
                communicator.publish("ready:App");
             },
             _handleAppStateChanges : function (newState) {
                console.log("Hash changed. Starting AppState change.");
                
                var place;
                
                if (newState.album) {
                   if (state.getCollection("Album").has(newState.album)) {
                      this._markerSelect(state.getMarker(state.getCollection("Album").get(newState.album)));
                   } else {
                      this.infoText.alert(gettext("INVALID_ALBUM"));
                   }
                } else if (newState.place) {
                   if (state.getCollection("Place").has(newState.place)) {
                      if (!newState.page) {
                         this._markerSelect(state.getMarker(state.getCollection("Place").get(newState.place)));
                      } else if (newState.page) {
                         place = state.getMarker(state.getCollection("Place").get(newState.place));
                         communicator.subscribeOnce("opened:place", function () {
                            //TODO Gallery does not yet support navigating to pages
                            // if (main.getUI().getGallery().hasPage(newState.page)) {
                               // main.getUI().getGallery().navigateToPage(newState.page);
                            // } else {
                               // if (place.getModel().getPhotoCollection().has(newState.photo)) {
                                  // this.infoText.alert(gettext("INVALID_PHOTO_AND_PAGE"));
                               // } else {
                                  // this.infoText.alert(gettext("INVALID_PAGE"));
                               // }
                            // }
                            if (newState.photo) {
                               if (place.getModel().getPhotoCollection().has(newState.photo)) {
                                 this._loadPhotoIntoSlideshow(place.getModel().getPhotoCollection().get(newState.photo));
                               } else {
                                  this.infoText.alert(gettext("INVALID_PHOTO"));
                               }
                            }
                         }, this);
                         this._placeOpen(place);
                      }
                   } else {
                      this.infoText.alert(gettext("INVALID_PLACE"));
                   }
                } else if (!newState.album && !newState.place) {
                   this._markerDeselect();
                } else {
                   throw new Error("InvalidAppStateError");
                }
             },
             _uiEnable : function () {
                this._setUIDisabled(false);
             },
             _uiDisable : function () {
                this._setUIDisabled(true);
             },
             _setUIDisabled : function (disable) {
                assertTrue(disable !== undefined, "disable mustn't be undefined");
                
                var ui = main.getUI(),
                    markers = state.getMarkers();
                
                if (state.isAlbumView()) {
                   ui.getGallery().setDisabled(disable);
                   ui.getSlideshow().setDisabled(disable);
                   ui.getFullscreen().setDisabled(disable);
                }
                ui.getControls().setDisabled(disable);
                ui.getInformation().setDisabled(disable);
                main.getMap().setDisabled(disable);
                $.each(markers, function (index, marker) {
                      marker.setDisabled(disable);
                });
                
                if (!disable) {
                   this._enableLinks();
                } else {
                   this._disableLinks();
                }
             },
             // Fullscreen is thread safe and does not need to be disabled.
             // _fullscreenDisable : function () {
             //    main.getUI().getFullscreen().setDisabled(true);
             // },
             // _fullscreenEnable : function () {
             //    main.getUI().getFullscreen().setDisabled(false);
             // },
             _disableLinks : function () {
               
                 $("a, .mp-control").css({
                    cursor: "not-allowed"
                 });
                 $("a").on("click.Disabled", function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                 }); 
             },
             _enableLinks : function () {
                 
                 console.log("in _enableLinks");
                 $("a, .mp-control").css({
                    cursor: ""
                 });
                 $("a").off(".Disabled");
             },
             _viewActivation : function (viewName) {
               var ui = main.getUI(),
                  possibleViews = {
                     Slideshow: ui.getSlideshow(),
                     Gallery: ui.getGallery(),
                     Fullscreen: ui.getFullscreen(),
                     Map: main.getMap(),
                     Dialog: ui.getInput()
                  };
                  
               possibleViews[viewName].setActive(true);
               $.each(possibleViews, function (name, view) {
                  if (view && name !== viewName) {
                     view.setActive(false);
                  }
               });
             },
             // handled in AppRouter now
             // _detailClose : function () {
                // if (state.isDashboardView() || !state.getCurrentLoadedMarker()) {
                   // main.getAppRouter().goTo(null);
                // }
             // },
             _photoOrderChange : function (photos) {
                var instance = this;
                this.publish("load:dialog", {
                   load : function () {
                      $("input[name='photos']").val(JSON.stringify(photos));
                   },
                   success : function () {
                      var place = main.getUIState().getCurrentLoadedPlace().getModel();
                      // update the 'real' photo order
                      photos.forEach(function (photo, index) {
                         place.getPhoto(photo.photo).order = photo.order;
                         console.log("Update order of photo %d successful.", index);
                      });
                      
                      console.log("All Photos updated. Updating Gallery.");
                      place.sortPhotos();
                      
                      photos = place.getPhotos();
                      main.getUI().getGallery().restart(photos);
                      if (main.getUI().getSlideshow().isStarted()) {
                         main.getUI().getSlideshow().restart(photos);
                      }

                   },
                   abort : function () {
                      console.log("UIFullGallery: Aborted updating order. Restoring old order");
                      instance.publish("abort:photoOrder");
                      //TODO this could be done better
                      main.getUI().getAdminGallery().refresh();
                   },
                   type : CONFIRM_DIALOG,
                   url : "/update-photos"
                });


             },
             _dialogLoad : function (options) {
                main.getUI().getInput().show(options);
             },
             _mapCenterChanged : function () {
                /*TODO current marker might not be centered anymore -> has to be notified & marked as not centered; 
                * yet when centering center_changed event is fired often -> marker would be marked as not centered even 
                * if it is
                */
             },

             _galleryThumbMouseleave : function () {
                main.getUI().getControls().hide(true);
             },
             /*
              * @private
              * @param {Photo} photo
              */
             _loadPhotoIntoSlideshow : function (photo) {
                if (state.getCurrentMarker()) {
                  state.getCurrentMarker().resetCurrent();
                }
                main.getUI().getControls().hide(false);
                main.getUI().getSlideshow().navigateTo(photo);
             },
             _markerMouseover : function (marker) {
                main.getUI().getControls().show({
                   "context": marker,
                   pixel: main.getMap().getPositionInPixel(marker)
                });
             },
             _markerMouseout : function () {
                main.getUI().getControls().hide(true);
             },
             // done directly in AppRouter now
             // _markerClick : function (marker) {
                // main.getAppRouter().goTo(marker.getModel().getType(), marker.getModel().getId());
             // },
             _markerSelect : function (marker) {
                var detail = main.getUI().getInformation();
                
                marker.select();
                detail.update(marker.getModel());
                
                if (state.isDashboardView()) {
                   marker.centerAndMoveLeft(.25);
                   detail.slideIn();
                }
             },
             _markerDeselect : function () {
                if (state.getCurrentMarker()) {
                  main.getUI().getInformation().closeDetail(true);
                  state.getCurrentMarker().resetCurrent();
                }
                if (state.isDashboardView()) {
                   main.getMap().showAll();
                }
             },
             /**
              * 
              * @param {Object} marker markerPresenter
              * @param {Object} init will be undefined when insert:marker events is published - can be used in AppController itself though
              * @see AppController._markerInitialInsert
              */
             _markerInsert : function (marker, init) {
                state.insertMarker(marker);
                marker.checkIconStatus();
                marker.show();
                if (!init) {
                   marker.open();
                   main.getMap().setNoMarkerMessage();
                }
             },
             _markerInitialInsert : function (markers) {
                var instance = this;
                $.each(markers, function (index, marker) {
                   instance._markerInsert(marker, true);
                });
             },
             _markerCentered : function (marker) {
                $.each(state.getMarkers(), function (index, markerPresenter) {
                   if (markerPresenter !== marker) {
                      markerPresenter.setCentered(false);
                   }
                });
             },
             _modelUpdate : function (model) {
                main.getUI().getInformation().update(model);
             },
             _usedSpaceUpdate : function (data) {
                main.getUI().getInformation().updateUsedSpace(data);
             },
             _slideshowUpdate : function (photo) {
                main.getUI().getInformation().update(photo);

                main.getUI().getGallery().navigateIfNecessary(photo);
                clientstate.insertVisitedPhoto(photo);
                photo.setVisited(true);
                main.getUI().getFullscreen().navigateTo(photo);
             },
             _slideshowBeforeLoad : function () {
                main.getUI().getInformation().hideDetail();
             },
             _slideshowClick : function () {
                main.getUI().getFullscreen().show();
             },
             _fullscreenNavigate : function (direction) {
                main.getUI().getSlideshow().navigateWithDirection(direction);
             },
             _modelInsert : function (model) {
                var type = model.getType();
                
                if (type === "Photo") {
                   // main.getUI().getGallery().insertPhoto(model);
                   // main.getUI().getSlideshow().insertPhoto(model);
                   // main.getUI().getAdminGallery().insertPhoto(model);
                } else if (type === "Album" || type === "Place") {
                   main.getMap().insertMarker(model, true);
                } else {
                   throw new Error("UnknownModelError");
                }
             },
             _modelDelete : function (model) {
                var type = model.getType(),
                    currentPlace = state.getCurrentLoadedPlace();
                
                main.getUI().getInformation().empty(model);
                
                if (type === "Photo") {
                   // main.getUI().getGallery().deletePhoto(model);
                   // main.getUI().getSlideshow().deletePhoto(model);
                   // main.getUI().getAdminGallery().deletePhoto(model);
                   // main.getUI().getFullscreen().deletePhoto(model);
                   state.getCurrentLoadedPlace().getModel().deletePhoto(model);
                } else if (type === "Place") {
                   if (currentPlace && currentPlace.getModel() === model) {
                      main.getUI().getGallery().reset();
                      main.getUI().getSlideshow().reset();
                      main.getUI().getAdminGallery().reset();
                      main.getUI().getFullscreen().reset();
                   }
                }
                
                if (type === "Place" || type === "Album") {
                   console.log(state.getMarker(model));
                   state.getMarker(model).hide();
                   main.getMap().setNoMarkerMessage();
                }
                
                
             },
             _placeOpen : function (placePresenter) {
                if (!placePresenter.isOpen()) {
                   var place = placePresenter.getModel(),
                     photos = place.getPhotoCollection();
                   state.setPhotoCollection(place.getPhotoCollection());
                   main.getUI().getInformation().update(place);
                   main.getUI().getPageTitleWidget().update(place.getTitle());
   
                   main.getUI().getGallery().load(photos);
                   main.getUI().getGallery().run();
   
                   main.getUI().getSlideshow().load(photos);
                   main.getUI().getAdminGallery().load(photos);
                   main.getUI().getFullscreen().load(photos);
   
                   main.getUI().getMessage().hide();
                   
                   $.each(state.getMarkers(), function (i, placePresenter) {
                      placePresenter.setOpened(false);
                   });
                   placePresenter.setOpened(true);
                }
                // fire the place opened event in any case
                communicator.publish("opened:place", placePresenter);
             },
             _photoVisited : function (photo) {
                main.getUI().getGallery().setPhotoVisited(photo);
             },
             _updatePageTitle : function () {
                var album = state.getAlbum();
                main.getUI().getInformation().update(album);
             }

          });
       });

