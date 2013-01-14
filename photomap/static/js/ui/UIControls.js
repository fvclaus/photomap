/*jslint */
/*global $, main, DASHBOARD_VIEW, ALBUM_VIEW */

"use strict";

/**
 * @author Frederik Claus
 * @class UIControls adds Listener to all input elements that are present once the site is loaded
 */

var UIControls;

UIControls = function (maxHeight) {

   this.$controls = $(".mp-controls-wrapper");
   this.$controls.hide();
   // icons of photo controls are not scaled yet
   this.$controls.isScaled = false;
   // tells the hide function whether or not the mouse entered the window
   this.$controls.isEntered = false;

   this.$delete = $("img.mp-option-delete");
   this.$update = $("img.mp-option-modify");
   this.$share = $("img.mp-option-share");

   this.$logout = $(".mp-option-logout");
   this.$insert = $(".mp-option-insert-photo");

};

UIControls.prototype = {

   initWithoutAjax : function () {
   },
   initAfterAjax : function () {
      
      var state, clientstate, page;
      state = main.getUIState();
      clientstate = main.getClientState();
      page = state.getPage();
      if (page === DASHBOARD_VIEW || (page === ALBUM_VIEW && clientstate.isAdmin())) {
         this.bindListener(page);
      }
   },
   /**
    * @description Displays modify control under a photo
    * @param $el The photo element under which controls are placed
    * @public
    */
   showPhotoControls : function ($el) {
      
      var center, tools;
      
      center = $el.offset();
      tools = main.getUI().getTools();
      center.left += tools.getRealWidth($el) / 2;
      center.top += tools.getRealHeight($el);

      // clear any present timeout, as it will hide the controls while the mousepointer never left
      if (this.hideControlsTimeoutId) {
         window.clearTimeout(this.hideControlsTimeoutId);
         this.hideControlsTimeoutId = null;
      }
      this._showMarkerControls(center);
   },

   /**
    * @description Controls are instantiated once and are used for albums, places and photos
    * @param {Object} center the bottom center of the element where the controls should be displayed
    * @private
    */
   _showMarkerControls : function (center) {
      
      var tools, factor;
      
      // calculate the offset
      tools = main.getUI().getTools();
      // center the controls below the center
      center.left -= tools.getRealWidth(this.$controls) / 2;
      
      // don't resize the icons all the time to save performance
      if (!this.$controls.isScaled) {
         // change factor depending on the page (-> number of controls in control-box)
         if (main.getUIState().isDashboard()) {
            factor = 1.5;
         } else {
            factor = 1;
         }
         this.$controls
            .width(this.$controls.width() * factor);
         this.$controls.isScaled = true;
      }

      // offset had a weird problem where it was pushing the controls down with every 2 consecutive offset calls
      this.$controls.css({
         top: center.top,
         left: center.left
      }).show();
   },
   /**
    * @public
    */
   setModifyAlbum : function (active) {
      this.isModifyAlbum = active;
      this.isModifyPlace = !active;
      this.isModifyPhoto = !active;
   },
   /**
    * @public
    */
   setModifyPlace : function (active) {
      this.isModifyPlace = active;
      this.isModifyAlbum = !active;
      this.isModifyPhoto = !active;
   },
   /**
    * @public
    */
   setModifyPhoto : function (active) {
      this.isModifyPhoto = active;
      this.isModifyPlace = !active;
      this.isModifyAlbum = !active;
   },
   /**
    * @description This is used as a callback to display the edit controls
    * @param {Album,Place} instance
    * @private
    */
   _displayEditControls : function (element) {
      
      var state, controls, projection, pixel, markerSize, mapOffset;
      state = main.getUIState();
      controls = main.getUI().getControls();

      if (element.getModel() === 'Album') {
         controls.setModifyAlbum(true);
         state.setCurrentAlbum(element);
      } else if (element.getModel() === 'Place') {
         controls.setModifyPlace(true);
         state.setCurrentPlace(element);
      } else {
         alert("Unknown class: " + element.getModel());
         return;
      }

      // gets the relative pixel position
      projection = main.getMap().getOverlay().getProjection();
      pixel = projection.fromLatLngToContainerPixel(element.getLatLng());
      // add height and half-width of the marker
      markerSize = element.getSize();
      pixel.y += markerSize.height;
      pixel.x += markerSize.width / 2;
      // add map offset
      mapOffset = $(".mp-map").offset();
      pixel.y += mapOffset.top;
      pixel.x += mapOffset.left;
      // show controls
      controls._showMarkerControls({
         top: pixel.y,
         left: pixel.x
      });
   },
   /**
    * @description hides the modify controls
    * @param {Boolean} timeout if the controls should be hidden after a predefined timout, when the controls are not entered
    * @private
    */
   hideEditControls : function (timeout) {
      
      var instance = this, hide;
      
      hide = function () {
         if (instance.$controls.isEntered) {
            return;
         }
         instance.$controls.hide();
      };

      if (timeout) {
         this.hideControlsTimeoutId = window.setTimeout(hide, 2000);
      } else {
         this.$controls.hide();
      }
   },
   /* ---- Listeners ---- */
   _fullDescriptionOpener : function (event) {
      
      main.getUI().getInformation().showFullDescription();
   },
   _fullDescriptionCloser : function (event) {
      
      main.getUI().getInformation().hideFullDescription();
   },
   bindFullDescriptionListener : function () {
      $("#mp-description").on("click", ".mp-open-full-description", this._fullDescriptionOpener);
      $(".mp-close-full-description").on("click", this._fullDescriptionCloser);
   },
   /**
    * @public
    * @see UIAlbum
    */
   bindInsertPhotoListener : function () {
      
      var place, insertHandler;
      insertHandler = function (event) {
         place = main.getUIState().getCurrentLoadedPlace();
         // reset load function
         main.getUI().getInput().getUpload("/insert-photo?place=" + place.id, null);
      };
      $("#mp-gallery").on("click.PhotoMap", ".mp-empty-tile", insertHandler);
      this.$insert.on("click.PhotoMap", insertHandler);
   },
   /**
    * @public
    * @see UITools
    */
   bindCopyListener : function () {
      // copy to clipboard with jquery (zclip) using ZeroClipboard (javascript and flash)
      $("#mp-copy-button").zclip('remove').zclip({
         path: 'static/js/zeroclipboard/zeroclipboard.swf',
         copy: $("#mp-share-link").val()
         /*afterCopy: function(){
            $(".mp-overlay-trigger").overlay().close();
         },*/
      });
   },
   /**
    * @private
    */
   _bindDeleteListener : function () {
      
      var instance, tools, state, photo, place, album, url, data;
      instance = this;
      state = main.getUIState();
      tools = main.getUI().getTools();
      
      this.$delete
         .on("click", function (event) {
            // hide current place's markers and clean photos from gallery
            photo = state.getCurrentPhoto();
            place = state.getCurrentPlace();
            album = state.getCurrentAlbum();

            if (instance.isModifyPhoto) {
               // delete current photo
               if (confirm("Do you really want to delete photo " + photo.title)) {
                  url = "/delete-photo";
                  data = { id: photo.id };
                  state.removePhoto(photo);
                  $("img[src='" + photo.source + "']").remove();
               } else {
                  return;
               }
            } else if (instance.isModifyPlace) {
                // delete current place
               if (confirm("Do you really want to delete place " + place.title)) {
                  url = "/delete-place";
                  data = { id: place.id };
                  state.removePlace(place);
                  main.getUI().deletePlace(place);
               } else {
                  return;
               }
            } else if (instance.isModifyAlbum) {
               // delete current album
               if (confirm("Do you really want to delete Album " + album.title)) {
                  url = "/delete-album";
                  data = { id: album.id };
                  album._delete();
               } else {
                  return;
               }
            } else {
               alert("I don't know what to delete. Did you set one of setModify{Album,Place,Photo}?");
               return;
            }

            // call to delete marker or photo in backend
            tools.deleteObject(url, data);
         });
   },
   /**
    * @private
    */
   _bindUpdateListener : function () {
      
      var instance, input, place, album, photo, state, $title, $description;
      instance = this;
      state = main.getUIState();
      input = main.getUI().getInput();
      
      this.$update
         .on("click", function (event) {
            place = state.getCurrentPlace();
            photo = state.getCurrentPhoto();
            album = state.getCurrentAlbum();

            
            if (instance.isModifyPhoto) {
               // edit current photo
               
               input
                  .onLoad(function () {
                     //prefill with values from selected picture
                     $("input[name=id]").val(photo.id);
                     $("input[name=order]").val(photo.order);
                     $title = $("input[name=title]").val(photo.title);
                     $description = $("textarea[name=description]").val(photo.description);

                     input.onForm(function () {
                        //reflect changes locally
                        photo.title = $title.val();
                        photo.description = $description.val();
                     });
                  })
                  .get("/update-photo");
            } else if (instance.isModifyPlace) {
               //edit current place
               //prefill with name and update on submit

               input
                  .onLoad(function () {
                     $("input[name=id]").val(place.id);
                     $title = $("input[name=title]").val(place.title);
                     $description = $("textarea[name=description]").val(place.description);

                     input.onForm(function () {
                        //reflect changes locally
                        place.title = $title.val();
                        place.description = $description.val();
                        main.getUI().getInformation().updatePlace();
                     });
                  })
                  .get("/update-place");
            } else if (instance.isModifyAlbum) {
               //edit current album
               //prefill with name and update on submit

               input
                  .onLoad(function () {
                     $("input[name=id]").val(album.id);
                     $title = $("input[name=title]").val(album.title);
                     $description = $("textarea[name=description]").val(album.description);

                     input.onForm(function () {
                        //reflect changes locally
                        album.title = $title.val();
                        album.description = $description.val();
                     });
                  })
                  .get("/update-album");
            }
         });
   },
   /**
    * @private
    */
   _bindControlListener : function () {
      
      var instance = this, place, state;
      state = main.getUIState();
      
      this.$controls
         .on("mouseleave", function () {
            instance.$controls.hide();
            instance.$controls.isEntered = false;
         })
         .on("mouseenter", function () {
            instance.$controls.isEntered = true;
         });
   },
   /**
    * @private
    */
   _bindShareListener : function () {
      
      var instance = this, state, tools, url, id;
      
      this.$share
         .on("click", function (event) {
            state = main.getUIState();
            tools = main.getUI().getTools();

            if (state.getAlbumShareURL() && state.getAlbumShareURL().id === state.getCurrentAlbum().id) {
               tools.openShareURL();
            } else {
               url = "/get-album-share";
               id = state.getCurrentAlbum().id;
               main.getClientServer().getShareLink(url, id);
            }
         });
   },
   bindPlaceListener : function (place) {
      
      var instance = this, places, state;
      state = main.getUIState();
      
      if (place !== undefined) {
         places = [place];
      } else {
         places = state.getPlaces();
      }
      places.forEach(function (place) {
         place.addListener("mouseover", function () {
            instance._displayEditControls(place);
         });
         place.addListener("mouseout", function () {
            instance.hideEditControls(true);
         });
      });
   },
   bindAlbumListener : function (album) {
      
      var instance = this, albums, state;
      state = main.getUIState();
      
      if (album !== undefined) {
         albums = [album];
      } else {
         albums = state.getAlbums();
      }
      albums.forEach(function (album) {
         album.addListener("mouseover", function () {
            instance._displayEditControls(album);
         });
         album.addListener("mouseout", function () {
            instance.hideEditControls(true);
         });
      });
   },
   /**
    * @description Binds all the Listeners required by this page. Also handles window.load Listener
    * @param {String} page Name of current page
    */
   bindListener : function (page) {
      
      this._bindDeleteListener();
      this._bindUpdateListener();
      this._bindControlListener();
      this._bindShareListener();
      this.bindFullDescriptionListener();
      if (page === DASHBOARD_VIEW) {
         this.bindAlbumListener();
      } else if (page === ALBUM_VIEW) {
         this.bindInsertPhotoListener();
         this.bindPlaceListener();
      } else {
         alert("Unknown page: " + page);
      }
   }
};
