/*jslint */
/*global $, define, main, init, initTest, finalizeInit, assertTrue, gettext */

"use strict";

/**
 * @author Frederik Claus, Marc-Leon Roemer
 * @class Controls communication in between the classes of KEIKEN
 */

define(["dojo/_base/declare",
        "../util/Communicator",
        "../ui/UIState",
        "../model/Album",
        "../model/Collection",
        "../util/ClientState",
        "../util/InfoText",
        "../util/Tools",
        "./AppStateHelper"],
   function (declare, communicator, state, Album, Collection, clientstate, InfoText, tools, appState) {
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
                  main.getUI().getControls().show({
                     modelInstance : marker.getModel(),
                     offset: main.getMap().getPositionInPixel(marker),
                     dimension : {
                        width : marker.getView().getSize().width
                     }
                  });
               },
               "mouseout:marker": function () {
                  main.getUI().getControls().hide(true);
               },
               "click:marker": function (markerPresenter) {
                  this._showDetail(markerPresenter.getModel());
                  main.getMap().updateMarkerStatus(markerPresenter, "select");
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
                     main.getMap().updateMarkerStatus(markerPresenter, "open");
                     appState.updateOpenedPlace(markerPresenter.getModel().getId());
                  }
               }
            }, this);
            communicator.subscribe({
               "close:detail": function () {
                  main.getMap().resetSelectedMarker();
                  this._hideDetail();
                  appState.updateDescription(null);
               },
               "click:photoDetailOpen": function () {
                  appState.updateDescription("photo");
               }
            }, this);
            
            communicator.subscribe("change:usedSpace", function (data) {
               main.getUI().getInformation().updateUsedSpace(data);
            });
            
            if (state.isAlbumView()) {
               
               communicator.subscribe({
                  "mouseleave:galleryThumb": function () {
                     main.getUI().getControls().hide(true);
                  },
                  "click:galleryThumb": function (photo) {
                     main.getMap().resetSelectedMarker();
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
                        main.getUI().getInformation().update(photo);
                        main.getUI().getGallery().navigateIfNecessary(photo);
                        main.getUI().getGallery().setPhotoVisited(photo);
                        clientstate.insertVisitedPhoto(photo);
                        photo.setVisited(true);
                        main.getUI().getFullscreen().navigateTo(photo);
                        appState.updatePhoto(photo.getId());
                     } else {
                        this.ignoreNextSlideshowUpdate = false;
                     }
                  },
                  "click:slideshowImage": function () {
                     main.getUI().getFullscreen().show();
                     appState.updateFullscreen(true);
                  }
               }, this);
               
               communicator.subscribe({
                  "navigate:fullscreen": function (direction) {
                     main.getUI().getSlideshow().navigateWithDirection(direction);
                  },
                  "click:fullscreenClose": function () {
                     appState.updateFullscreen(false);
                  }
               });
               communicator.subscribe("click:pageTitle", function () {
                  main.getUI().getInformation().update(state.getAlbum());
                  appState.updateDescription("album");
               });
               communicator.subscribe("clicked:GalleryOpenButton", function () {
                  main.getUI().getAdminGallery().run();
               });
               communicator.subscribe("hover:GalleryPhoto", function (data) {
                  main.getUI().getControls().show({
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
               main.getUI().getPageTitleWidget().update(albumData.getTitle());
               main.getMap().start(albumData, true, albumData.isOwner());
               main.getUI().getGallery().startup({ adminMode : albumData.isOwner() });
               this._updateState(initialState, true);
            } else {
               albums = new Collection(albumData, {
                  modelConstructor: Album,
                  modelType: "Album"
               });
               main.getMap().start(albums, false);
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
                  main.getMap().updateMarkerStatus(album, "select");
               } else if (newState.album) {
                  this.infoText.alert(gettext("INVALID_SELECTED_ALBUM"));
               } else if (!newState.album) {
                  main.getMap().resetSelectedMarker();
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
                  if (!main.getMap().getOpenedMarker() || openedPlace !== main.getMap().getOpenedMarker().getModel()) {
                     this._startPhotoWidgets(openedPlace);
                     main.getMap().updateMarkerStatus(openedPlace, "open");
                  }
               } else if (newState.openedPlace) {
                  this.infoText.alert(gettext("INVALID_OPENED_PLACE"));
               } else {
                  main.getMap().resetOpenedMarker();
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
               if (newState.page && newState.page <= main.getUI().getGallery().getNPages()) {
                  main.getUI().getGallery().navigateTo(newState.page);
               }
               // start fullscreen if necessary
               if (photo && newState.fullscreen) {
                  main.getUI().getFullscreen().run();
                  main.getUI().getFullscreen().show();
               } else {
                  main.getUI().getFullscreen().hide();
               }
               // reset selected place if selectedPlace is undefined
               if (!newState.selectedPlace) {
                  main.getMap().resetSelectedMarker();
               } else if (selectedPlace) {
                  main.getMap().updateMarkerStatus(selectedPlace, "select");
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
         /*
          * @private
          * @param {Photo} photo
          */
         _navigateSlideshow : function (photo) {
            main.getUI().getControls().hide(false);
            main.getUI().getSlideshow().run();
            main.getUI().getSlideshow().navigateTo(photo);
         },
         _showDetail : function (markerModel) {
            
            if (!markerModel) {
               return;
            }
            
            var detail = main.getUI().getInformation();
            
            detail.update(markerModel);
            
            if (state.isDashboardView()) {
               main.getMap().centerMarker(markerModel, -0.25);
               detail.slideIn();
            }
         },
         _hideDetail : function () {
            main.getUI().getInformation().closeDetail(true);
            if (state.isDashboardView()) {
               main.getMap().showAll();
            }
         },
         _startPhotoWidgets : function (place) {
            var photos = place.getPhotos();
            main.getUI().getInformation().update(place);
            main.getUI().getGallery().load(photos);
            main.getUI().getGallery().run();
            main.getUI().getSlideshow().load(photos);
            main.getUI().getAdminGallery().load(photos);
            main.getUI().getFullscreen().load(photos);
         }
      });
   });

