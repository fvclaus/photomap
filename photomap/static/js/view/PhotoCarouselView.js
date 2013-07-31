/*jslint */
/*global $, define, main, window, assert, assertTrue, assertString */

"use strict";

/**
 * @author Frederik Claus
 * @description defines handler to initialize and navigate through the carousel and to load images (supports lazy-loading)
 * @note every callback will be called everytime no matter if there is something to load/update or not
 * @param options.beforeLoad Called before the photos are loaded
 * @param options.afterLoad Called after all photos are loaded (successful or not)
 * @param options.onUpdate Called after all photos are updated
 * @param options.navigateToInsertedPhoto
 * @param options.context
 */
  
define(["dojo/_base/declare",
        "view/View",
        "model/Photo",
        "util/PhotoPages",
        "util/Tools", 
        "module",
        "util/CarouselAnimation"], 
       function (declare, View, Photo, PhotoPages, tools, module, carouselAnimation) {
          
          return declare (View, {
             ID_HTML_ATTRIBUTE : "data-keiken-id",
             constructor : function ($photos, photos, srcPropertyName, options) {
                assertTrue($photos.size() > 0, "Can't build a Carousel without placeholder for photos.");
                
                this.module = module;
                photos.forEach(function (photo) {
                   assertTrue(photo instanceof Photo);
                   assertString(photo[srcPropertyName]);
                });

                this.defaults = {
                   lazy : false,
                   effect : "fade",
                   duration: 500,
                   // No need to check for the existince of these functions.
                   beforeLoad : function () {},
                   afterLoad : function () {},
                   onUpdate : function () {},
                   context : this,
                };
                this.options = $.extend({}, this.defaults, options);
                this.srcPropertyName = srcPropertyName;
                
                this.$items = $photos;
                // recalculate margins when window is resized
                $(window).resize(function () {
                   $photos.each(function () {
                      tools.centerElement($(this), "vertical");
                   });
                });
                this.size = this.$items.length;

                this.dataPage = new PhotoPages(photos, this.size, this.srcPropertyName);
                
                this.currentPage = null;
                this.isStarted = false;
             },
             update : function (photos) {
               console.log(photos);
               this.dataPage.update(photos);
               this.currentPage = this.dataPage.getCurrentPage();
               this._load();
             },
             /**
              * @description Starts the carousel by loading the first or the requested page
              * @param {Photo} photo: Null to start with the first photo.
              */
             start : function (photo) {
                this.isStarted = true;
                if (photo) {
                   this.navigateTo(photo);
                } else {
                   this.currentPage = this.dataPage.getPage("first");
                   this._load();
                }
             },
             insertPhoto : function (photo) {
                assertTrue(photo instanceof Photo);
                
                this.log("Inserting new photo %s to Carousel.", photo);
                // update page
                this.dataPage.insertPhoto(photo);
                var from = this.dataPage.getIndexOfPhoto(photo);
                
                // Did we insert on the current page? Then we need to update it
                if (this.isLastPage()){
                   this.log("New photo is inserted on current page. Reload current page from index %d.", from);
                   this.currentPage = this.dataPage.getPage("current");
                   this._load(from);
                } else if (this.options.navigateToInsertedPhoto) {
                   // config: Show newly inserted photos
                   this.currentPage = this.dataPage.getPage("last");
                   this._load();
                } else { // Call _update to correct photo number, etc
                   this.options.onUpdate.call(this.options.context, $());
                }
                   
             },
             deletePhoto : function (photo) {
                assertTrue(photo instanceof Photo, "input parameter photo has to be model of the type Photo");

                // Deal with a quick succession of deletePhoto() calls.
                // This will merge the onFadeOut Handler with Timeout (with src present)  with the next one without timeout (without src present).
                // This does not work for several deletePhoto() calls where the src is not loaded.
                if (this._deleteThreat !== null) {
                   this._deleteThreat = function () {
                   };
                }

                var oldPage = this.dataPage.getPage("current"),
                    $currentItem = null,
                    // oldPage pages photo instances.
                    from = oldPage.indexOf(photo),
                    instance = this,
                    onFadeOut = function () {
                       this.currentPage = this.dataPage.getPage("current");
                       // we need to update everything from 'from' to the last entry of the oldPage
                       //TODO get the real length of the oldPage, currently this will always be this.size
                       this._load(from, oldPage.length);
                       instance._deleteThreat = null;
                    };


                this.dataPage.deletePhoto(photo);

                // Did we delete on the current page?
                if (from !== -1) {
                   $currentItem = this.$items
                      .filter("img[src='" + photo[this.srcPropertyName] + "']");
                   if ($currentItem.length > 0) {
                      $currentItem.fadeOut(500, function () {
                         $(this).attr("src", null);
                         onFadeOut.apply(instance);
                      });
                   } else { // The image has not been loaded yet. Update immediately.
                      // Give previous delete commands the change to execute before.
                      onFadeOut.apply(instance);
                   }
                }
                this._deleteThreat = onFadeOut;
             },
             /**
              * @description resets carousel, so that no images are shown
              */
             reset : function () {
                
                this.dataPage = null;
                this.options = null;
                this.currentPage = null;
                this.$items.each(function (index) {
                   $(this).hide().attr("src", "");
                });
             },
             /* 
              * @public
              * @param {String | Int | Photo} to
              */
             navigateTo : function (to) {
                assert(this.isStarted, true, "carousel has to be started already");
                switch(typeof to) {
                case "string":
                   assertTrue((to === "start") || (to === "end"));
                   break;
                case "object" :
                   to = this._getIndexForPhoto(to);
                   assertTrue(to >= 0, "Photo must be a legal index.");
                   break;
                case "number" : 
                   assertTrue(to >= 0, "To must be a legal index.");
                   break;
                default: 
                   assertTrue(false, "Unknown type " + typeof to);
                   break;
                }

                switch (to) {
                   case "start":
                      this.currentPage = this.dataPage.getPage("first");
                      break;
                   case "end":
                      this.currentPage = this.dataPage.getPage("last");
                      break;
                   default:
                      this.currentPage = this.dataPage.getPage(to);
                      break;
                }
                this._load();
             },
             navigateLeft : function () {
                this.currentPage = this.dataPage.getPage("previous");
                this._load();
             },
             navigateRight : function () {
                this.currentPage = this.dataPage.getPage("next");
                this._load();
             },
             isLastPage : function () {
                return this.dataPage.isLastPage();
             },
             getAllImageSources : function () {
                return this.dataPage.getAllImageSources();
             },
             getAllPhotos : function () {
                return this.dataPage.getAllPhotos();
             },
             _getIndexForPhoto : function (photo) {
                return this.getAllPhotos().indexOf(photo);
             },
             /*
              * @public
              * @returns {Photo} If src present, null otherwise.
              */
             getPhotoForSrc : function (src) {
                assertString(src, "src must be of type string.");
                var photo = null,
                    photoIndex = 0,
                    photos = this.getAllPhotos();
                for (photoIndex = 0; photoIndex < photos.length; photoIndex++) {
                   photo = photos[photoIndex];
                   if (photo[this.srcPropertyName] === src) {
                      return photo;
                   }
                }
                return null;
             },
                
             /**
              * @description Loads all photos, or just current page depending on this.options.lazy (=true/false). 
              * When everything is loaded this.options.onLoad (optional)  is executed and the carousel is updated to show the current page.
              * @param {int} from Index of the first photo element to update. Default is 0. 
              * @param {int} to Index of the last photo element to update. Defaults to the length of the current Page
              * This can be used when items get deleted in the middle of the page. The last elements would be ignored without the to parameter.
              */
             _load : function (from, to) {
                // Storing photos.length in an temporary variable will corrupt the loading/update process.
                // It is possible that the photos array will be modified concurrently and the length changes.
                var loader, 
                    photoIndex = 0,
                    loadHandler,
                    loaded = 0, 
                    maxLoad, 
                    currentPage = null,
                    photo = null, 
                    photos = null,
                    instance = this;

                // The loading from before has not finished yet.
                // If there is quick succession of navigate calls, it is not really deterministic which photo will be shown.
                // This is because the download speed of the photos varies. The slowest wins and will overwrite all other ones.
                if (this._updateThreat !== null) {
                   // Overwrite the old loadHandler so it will never call _update.
                   this._updateThreat = function () {
                   };
                }

                if (from === undefined || from === null) {
                   from = 0;
                }

                // only load current page
                //TODO this should only load pictures from index 'from' , if specified
                if (this.options.lazy) {
                   // filter current page to get the actual amount of images
                   photos = this.currentPage.filter(function (e, i) {
                      return e !== null;
                   });
                   // regardless of whats actually on a page, we must update all entries to remove the old ones
                   to = this.size;
                // load everything
                } else {
                   photos = this.getAllPhotos();
                }
                // handler is called after all images are loaded
                loadHandler = function () {
                   ++loaded;

                   if (loaded >= photos.length) {
                      // if there is a load-handler specified in the options, execute it first
                      if (typeof instance.options.afterLoad === "function") {
                         // trigger the afterLoad event
                         instance.options.afterLoad.call(instance.options.context, instance.$items.slice(from, to || photos.length));
                      }
                      // start updating the srcs
                      instance._update(from, to || photos.length);
                      // Loading finished. Can't abort anymore.
                      instance._updateThreat = null;
                   }
                };

                loader = function () {
                   // length could change in the meantime
                   if (photos.length === 0) {
                      instance.options.afterLoad.call(instance.options.context, instance.$items.slice(from, to || photos.length));
                      instance._update();
                   }
                   for (photoIndex = 0; photoIndex < photos.length; photoIndex++) {
                      photo = photos[photoIndex];
                      console.log(photo);
                      $('<img/>')
                         .load(loadHandler)
                         .error(loadHandler)
                         .attr('src', photo.getSource(instance.srcPropertyName));
                   }
                };
                carouselAnimation.start({
                   items: instance.$items,
                   loader: this.options.loader,
                   animation: this.options.effect,
                   animationTime: this.options.duration,
                   onStart : loader
                });


                // trigger the beforeLoad event
                this.options.beforeLoad.call(this.options.context, this.$items.slice(from, to || photos.length));

                // this is called at startup when there are no photos present or after all photos are deleted
                if (photos.length === 0){
                   this.options.afterLoad.call(this.options.context, this.$items.slice(from, to || photos.length));
                   this.options.onUpdate.call(this.options.context, this.$items.slice(from, to || photos.length));

                }
                // Store a reference to the loader function.
                // This is needed to abort the loading at a later point.
                this._updateThreat = loadHandler;
             },
             /**
              * @description Updates carousel to show current page.
              * @param {int} from: The index of the first photo that gets updated. Default is 0
              */
             //TODO this i called even when not all photo could be loaded (e.g network error)
             // we need to indicate that a photo could not be loaded
             _update : function (from, to) {
                
                if (!from) {
                   $items = this.$items;
                }
                
                var instance = this,
                    photos = [],
                    $items = this.$items.slice(from, to);
                    console.log(from + " " + to);
                    console.log($items.length);
                    
                assertTrue($items.size() > 0, "$items has to contain at least one item");
0                
                $.each(this.currentPage, function (index, photo) {
                   if (photo !== null) {
                      // Note: this is a reference and might be gone, once the onEnd callback is called.
                      photos.push(photo);
                   }
                });
                console.log(photos.length);
                
                carouselAnimation.end({
                   items: $items,
                   "photos": photos,
                   srcPropertyName: this.srcPropertyName,
                   loader: this.options.loader,
                   animation: this.options.effect,
                   animationTime: this.options.duration,
                   onEnd: function ($photos) {
                      $photos.each(function (photoIndex, photoNode) {
                         // During the time the src are loaded and updated the photos might have already been deleted.
                         try {
                            // This makes it possible to identify the photo by only looking at the img tag. The src of a photo must not be unique.
                            $(photoNode).attr(instance.ID_HTML_ATTRIBUTE, photos[photoIndex].getId());
                         } catch (e) {
                            instance.log("End of animation, but photo seems to be not present anymore. It has probably been deleted.");
                         }
                      });
                      instance.options.onUpdate.call(instance.options.context, $photos);
                   },
                   context: instance.options.context
                });
             }
          });
       });
   