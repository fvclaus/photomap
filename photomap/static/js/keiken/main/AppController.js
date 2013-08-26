/*jslint */
/*global $, define, main, init, initTest, finalizeInit, assertTrue, gettext */

"use strict";

/**
 * @author Frederik Claus, Marc-Leon Roemer
 * @class Controls communication in between the classes of KEIKEN
 */

define([
   "dojo/_base/declare",
   "./Main",
   "../ui/UI",
   "../util/Communicator",
   "../ui/UIState",
   "../model/Album",
   "../model/Collection",
   "../util/ClientState",
   "../util/InfoText",
   "../util/Tools",
   "./AppStateHelper"
],
   function (declare, main, ui, communicator, state, Album, Collection, clientstate, InfoText, tools, appState) {
      var map = main.getMap(),
         gallery = ui.getGallery(),
         slideshow = ui.getSlideshow(),
         description = ui.getInformation(),
         fullscreen = ui.getFullscreen(),
         adminGallery = ui.getAdminGallery(),
         pageTitle = ui.getPageTitleWidget(),
         controls = ui.getControls(),
         dialog = ui.getInput();
      
      return declare(null, {
         
         constructor : function () {
            //TODO detail has to be updated when model is deleted or updated -> collections ?!
            var instance = this;
            // Instantiate an infotext in case user needs to be informed about sth (use this.infotext.alert(message) for that)
            this.infoText = new InfoText();
            // instantiate attributes that tell the controller whether an event should be ignored
            this.ignoreNextSlideshowUpdate = false;
            this.ignoreNextAppStateChange = true;
            
            /* -------- hash management -------- */
            $(window)
               .on("popstate", function () {
                  if (!instance.ignoreNextAppStateChange) {
                     var newState = appState.getCurrentState();
                     console.log("New AppState:");
                     console.log(newState);
                     instance._updateState(newState);
                  } else {
                     instance.ignoreNextAppStateChange = false;
                  }
               });
            communicator.subscribeOnce("init", this._init, this);
            communicator.subscribe("activate:view", this._viewActivation);
            
            communicator.subscribe({
               "mouseover:marker": function (marker) {
                  controls.show({
                     modelInstance : marker.getModel(),
                     offset: map.getPositionInPixel(marker),
                     dimension : {
                        width : marker.getView().getSize().width
                     }
                  });
               },
               "mouseout:marker": function () {
                  controls.hide(true);
               },
               "click:marker": function (markerPresenter) {
                  this._showDetail(markerPresenter.getModel());
                  map.updateMarkerStatus(markerPresenter, "select");
                  if (markerPresenter.getModel().getType() === "Album") {
                     appState.updateAlbum(markerPresenter.getModel().getId());
                  } else {
                     appState.updateSelectedPlace(markerPresenter.getModel().getId());
                  }
               },
               "dblClick:marker": function (markerPresenter) {
                  if (markerPresenter.getModel().getType() === "Album") {
                     // build url -> format models/model/(id/)request
                     window.location.href = '/album/' + markerPresenter.model.getId() + '/view/' + markerPresenter.model.getSecret() + "/";
                  } else {
                     this._startPhotoWidgets(markerPresenter.getModel());
                     map.updateMarkerStatus(markerPresenter, "open");
                     appState.updateOpenedPlace(markerPresenter.getModel().getId());
                  }
               }
            }, this);
            communicator.subscribe({
               "close:detail": function () {
                  map.resetSelectedMarker();
                  this._hideDetail();
                  appState.updateDescription(null);
               },
               "click:photoDetailOpen": function () {
                  appState.updateDescription("photo");
               }
            }, this);
            
            communicator.subscribe("change:usedSpace", function (data) {
               description.updateUsedSpace(data);
            });
            
            if (state.isAlbumView()) {
               
               communicator.subscribe({
                  "mouseleave:galleryThumb": function () {
                     controls.hide(true);
                  },
                  "click:galleryThumb": function (photo) {
                     map.resetSelectedMarker();
                     this._hideDetail();
                     this._navigateSlideshow(photo);
                     appState.updatePhoto(photo.getId());
                  },
                  "opened:GalleryPage": function (pageIndex) {
                     appState.updatePage(pageIndex);
                  }
               }, this);
               
               communicator.subscribe({
                  "beforeLoad:slideshow": function () {
                     this._hideDetail();
                  },
                  "update:slideshow": function (photo) {
                     if (!this.ignoreNextSlideshowUpdate) {
                        description.update(photo);
                        gallery.navigateIfNecessary(photo);
                        gallery.setPhotoVisited(photo);
                        clientstate.insertVisitedPhoto(photo);
                        photo.setVisited(true);
                        fullscreen.navigateTo(photo);
                        appState.updatePhoto(photo.getId());
                     } else {
                        this.ignoreNextSlideshowUpdate = false;
                     }
                  },
                  "click:slideshowImage": function () {
                     fullscreen.show();
                     appState.updateFullscreen(true);
                  }
               }, this);
               
               communicator.subscribe({
                  "navigate:fullscreen": function (direction) {
                     slideshow.navigateWithDirection(direction);
                  },
                  "click:fullscreenClose": function () {
                     appState.updateFullscreen(false);
                  }
               });
               communicator.subscribe("click:pageTitle", function () {
                  description.update(state.getAlbum());
                  appState.updateDescription("album");
               });
               communicator.subscribe("clicked:GalleryOpenButton", function () {
                  adminGallery.run();
               });
               communicator.subscribe("hover:GalleryPhoto", function (data) {
                  controls.show({
                     modelInstance : data.photo,
                     offset : data.element.offset(),
                     dimension : {
                        width : tools.getRealWidth(data.element)
                     }
                  });
               });
            }
         },
         /*
          * --------------------------------------------------
          * Handler: 
          * --------------------------------------------------
          */
         _init : function (albumData) {
            var albums, initialState;
            if (state.isAlbumView()) {
               // albumData is a single album
               state.setAlbum(albumData);
               // set initial state -> opened description, and maybe place or even photo
               initialState = appState.setInitialState();
               pageTitle.update(albumData.getTitle());
               map.startup(albumData, true, albumData.isOwner());
               gallery.startup({ adminMode : albumData.isOwner() });
               this._updateState(initialState, true);
            } else {
               albums = new Collection(albumData, {
                  modelConstructor: Album,
                  modelType: "Album"
               });
               map.startup(albums, false);
               state.setAlbums(albums);
            }
            clientstate.init();
         },
         _updateState : function (newState, initialCall) {
            //ignore next AppChange - why? some browser trigger popstate after page load and some don't, for those who do the appstate will be initialized and then changed which is not necessary and causes troubles at some occasions..
            this.ignoreNextAppStateChange = initialCall || false;
            var album, selectedPlace, openedPlace, photo;
            // start with testing if it's dashboard view -> the only possible action is album-selection
            if (state.isDashboardView()) {
               album = state.getAlbums().get(newState.album);
               if (album) {
                  map.updateMarkerStatus(album, "select");
               } else if (newState.album) {
                  this.infoText.alert(gettext("INVALID_SELECTED_ALBUM"));
               } else if (!newState.album) {
                  map.resetSelectedMarker();
               }
            // if not -> albumview -> more actions possible
            } else {
               // get the correct models
               album = state.getAlbum();
               selectedPlace = album.getPlaces().get(newState.selectedPlace);
               openedPlace = album.getPlaces().get(newState.openedPlace);
               if (openedPlace) {
                  photo = openedPlace.getPhotos().get(newState.photo);
               }
               // open place if necessary
               if (openedPlace) {
                  if (!map.getOpenedMarker() || openedPlace !== map.getOpenedMarker().getModel()) {
                     this._startPhotoWidgets(openedPlace);
                     map.updateMarkerStatus(openedPlace, "open");
                  }
               } else if (newState.openedPlace) {
                  this.infoText.alert(gettext("INVALID_OPENED_PLACE"));
               } else {
                  map.resetOpenedMarker();
               }
               // load photo if necessary
               if (photo) {
                  // ignore next slideshow update to prevent gallery page from being auto navigated, unless (!) it is the initial appstate update
                  this.ignoreNextSlideshowUpdate = !initialCall;
                  this._navigateSlideshow(photo);
               } else if (newState.photo) {
                  this.infoText.alert(gettext("INVALID_LOADED_PHOTO"));
               }
               // navigate gallery if necessary
               if (newState.page && newState.page <= gallery.getNPages()) {
                  gallery.navigateTo(newState.page);
               }
               // start fullscreen if necessary
               if (photo && newState.fullscreen) {
                  fullscreen.run();
                  fullscreen.show();
               } else {
                  fullscreen.hide();
               }
               // reset selected place if selectedPlace is undefined
               if (!newState.selectedPlace) {
                  map.resetSelectedMarker();
               } else if (selectedPlace) {
                  map.updateMarkerStatus(selectedPlace, "select");
               }
            }
            // display the correct description if necessary
            switch (newState.description) {
            case "album":
               this._showDetail(album);
               break;
            case "place":
               this._showDetail(selectedPlace);
               break;
            case "photo":
               this._showDetail(photo);
               break;
            default:
               this._hideDetail();
               break;
            }
         },
         _viewActivation : function (viewName) {
            var possibleViews = {
                  Slideshow: slideshow,
                  Gallery: gallery,
                  Fullscreen: fullscreen,
                  Map: map,
                  Dialog: dialog
               };
            
            possibleViews[viewName].setActive(true);
            $.each(possibleViews, function (name, view) {
               if (view && name !== viewName) {
                  view.setActive(false);
               }
            });
         },
         /*
          * @private
          * @param {Photo} photo
          */
         _navigateSlideshow : function (photo) {
            controls.hide(false);
            slideshow.run();
            slideshow.navigateTo(photo);
         },
         _showDetail : function (markerModel) {
            if (!markerModel) {
               return;
            }
            description.update(markerModel);
            
            if (state.isDashboardView()) {
               map.centerMarker(markerModel, -0.25);
               description.slideIn();
            }
         },
         _hideDetail : function () {
            description.closeDetail(true);
            if (state.isDashboardView()) {
               map.showAll();
            }
         },
         _startPhotoWidgets : function (place) {
            var photos = place.getPhotos();
            description.update(place);
            gallery.load(photos);
            gallery.run();
            slideshow.load(photos);
            adminGallery.load(photos);
            fullscreen.load(photos);
         }
      });
   });

