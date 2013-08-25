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
        "../util/HashHelper"],
   function (declare, communicator, state, Album, Collection, clientstate, InfoText, tools, hash) {
      return declare(null, {
         
         constructor : function () {
            //TODO detail has to be updated when model is deleted or updated -> collections ?!
            var instance = this;
            // Instantiate an infotext in case user needs to be informed about sth (use this.infotext.alert(message) for that)
            this.infoText = new InfoText();
            /* -------- hash management -------- */
            $(window)
               .on("load", function () {
                  var state = hash.parse();
                  console.log("Initial AppState:");
                  console.log(state);
               })
               .on("hashchange", function () {
                  var state = hash.getCurrentState();
                  console.log("New AppState:");
                  console.log(state);
               });
            communicator.subscribeOnce("init", this._init);
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
                  this._showDetail(markerPresenter);
                  main.getMap().updateMarkerStatus(markerPresenter, "select");
               },
               "dblClick:marker": function (markerPresenter) {
                  if (markerPresenter.getModel().getType() === "Album") {
                     // build url -> format models/model/(id/)request
                     window.location.href = '/album/' + markerPresenter.model.getId() + '/view/' + markerPresenter.model.getSecret() + "/";
                  } else {
                     this._startPhotoWidgets(markerPresenter.getModel());
                     main.getMap().updateMarkerStatus(markerPresenter, "open");
                  }
               }
            }, this);
            
            communicator.subscribe("close:detail", function () {
               main.getMap().resetSelectedMarker();
               this._hideDetail();
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
                     this._navigateSlideshow(photo);
                     //TODO do sth like changing hash/state and navigate the slideshow
                  }
               }, this);
               
               communicator.subscribe({
                  "beforeLoad:slideshow": function () {
                     main.getUI().getInformation().hideDetail();
                  },
                  "update:slideshow": function (photo) {
                     main.getUI().getInformation().update(photo);
                     main.getUI().getGallery().navigateIfNecessary(photo);
                     clientstate.insertVisitedPhoto(photo);
                     photo.setVisited(true);
                     main.getUI().getFullscreen().navigateTo(photo);
                  },
                  "click:slideshowImage": function () {
                     main.getUI().getFullscreen().show();
                  }
               });
               
               communicator.subscribe("navigate:fullscreen", function (direction) {
                  main.getUI().getSlideshow().navigateWithDirection(direction);
               });
               communicator.subscribe("close:detail", function () {
                  main.getMap().resetSelectedMarker();
                  //TODO update hash/state accordingly
               });
               
               communicator.subscribe("change:photoOrder", this._openPhotosUpdateDialog);
               communicator.subscribe("visited:photo", function (photo) {
                  main.getUI().getGallery().setPhotoVisited(photo);
               });
               communicator.subscribe("click:pageTitle", function () {
                  main.getUI().getInformation().update(state.getAlbum());
               });
               communicator.subscribe("clicked:GalleryOpenButton", function () {
                  main.getUI().getAdminGallery().run();
               });
               communicator.subscribe("hover:GalleryPhoto", function (data) {
                  state.setCurrentPhoto(data.photo);
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
            if (state.isAlbumView()) {
               // albumData is a single album
               main.getUI().getInformation().update(albumData);
               main.getUI().getPageTitleWidget().update(albumData.getTitle());
               state.setAlbum(albumData);
               main.getMap().start(albumData, true, albumData.isOwner());
            } else {
               var albums = new Collection(albumData, {
                  modelConstructor: Album,
                  modelType: "Album"
               });
               main.getMap().start(albums, false);
               state.setAlbums(albums);
            }
            clientstate.init();
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
         _openPhotosUpdateDialog : function (photos) {
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
                  
                  photos = place.getPhotos().getAll();
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
         /*
          * @private
          * @param {Photo} photo
          */
         _navigateSlideshow : function (photo) {
            main.getUI().getControls().hide(false);
            main.getUI().getSlideshow().navigateTo(photo);
         },
         _showDetail : function (markerPresenter) {
            var detail = main.getUI().getInformation();
            
            detail.update(markerPresenter.getModel());
            
            if (state.isDashboardView()) {
               main.getMap().centerMarker(markerPresenter, -0.25);
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
            main.getUI().getGallery().startup();
            main.getUI().getGallery().load(photos);
            main.getUI().getGallery().run();
            main.getUI().getSlideshow().startup();
            main.getUI().getSlideshow().load(photos);
            main.getUI().getAdminGallery().startup();
            main.getUI().getAdminGallery().load(photos);
            main.getUI().getFullscreen().startup();
            main.getUI().getFullscreen().load(photos);
         }
      });
   });

