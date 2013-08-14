/*jslint */
/*global $, define, window, assert, assertTrue, assertInstance, assertString */

"use strict";

/**
 * @author Frederik Claus
 * @description Manages and displays photos in one or more image elements. This class is thread-safe and all functions can be accessed within callbacks. It provides functions to navigate between the photos and callbacks to add some custom behaviour.
 * It automatically sets an attribute 'data-keiken-id' on every photo that holds the Id of the photo. This can be used to retrieve the original photo instance.
 * @param {Function} options.beforeLoad: Called before the photos are loaded.
 * @param {Function} options.afterLoad: Called after all photos are loaded (successful or not).
 * @param {Function} options.onUpdate: Called after all photos are updated.
 * @param {Boolean} options.navigateToInsertedPhoto: Defaults to false.
 * @param {Object} options.context:  Defaults to false.
 * @param {Boolean} options.lazy:  Defaults to true.
 * @param {String} options.effect:  fade || flip. Defaults to fade.
 */
  
define(["dojo/_base/declare",
        "view/View",
        "model/Photo",
        "util/PhotoPages",
        "util/Tools", 
        "util/CarouselAnimation"], 
       function (declare, View, Photo, PhotoPages, tools, carouselAnimation) {
          
          return declare (View, {
             ID_HTML_ATTRIBUTE : "data-keiken-id",
             constructor : function ($photos, photos, srcPropertyName, options) {
                assertTrue($photos.size() > 0, "Can't build a Carousel without placeholder for photos.");
                
                photos.forEach(function (photo) {
                   assertTrue(photo instanceof Photo);
                   assertString(photo[srcPropertyName]);
                });

                this.defaults = {
                   lazy : true,
                   effect : "fade",
                   duration: 500,
                   loader : $(),
                   // No need to check for the existence of these functions.
                   beforeLoad : function () {},
                   afterLoad : function () {},
                   onUpdate : function () {},
                   navigateToInsertedPhoto : false,
                   context : this,
                };
                
                this.options = $.extend({}, this.defaults, options);
                
                assertTrue(tools.countAttributes(this.options) === tools.countAttributes(this.defaults), "The options you defined seem to have more attributes than available.");
                this.srcPropertyName = srcPropertyName;
                this.nLoadHandler = 0;
                
                this.$photos = $photos;
                // recalculate margins when window is resized
                $(window).resize(function () {
                   $photos.each(function () {
                      tools.centerElement($(this), "vertical");
                   });
                });
                this.size = this.$photos.length;

                this.dataPage = new PhotoPages(photos, this.size, this.srcPropertyName);
                
                this.currentPage = null;
                this.isStarted = false;
             },
             update : function (photos) {
               this.dataPage.update(photos);
               this.currentPage = this.dataPage.getCurrentPage();
               this._load();
             },
             /**
              * @description Starts the carousel by loading the first or the requested page
              * @param {Photo} photo: Null to start with the first photo.
              * @idempotent
              */
             start : function (photo) {
                assertTrue(photo === undefined || (photo.isInstanceOf && photo.isInstanceOf(Photo)), "Photo parameter must be undefined or an instance of Photo.");
                if (photo) {
                   assertTrue(this._getIndexForPhoto(photo) !== -1, "Photo parameter must be part of this carousel.");
                   this.isStarted = true;
                   this.navigateTo(photo);
                } else {
                   this.currentPage = this.dataPage.getPage("first");
                   this.isStarted = true;
                   this._load();
                }
             },
             insertPhoto : function (photo) {
                assertTrue(photo instanceof Photo, "Parameter photo must be an instance of Photo.");
                
                console.log("PhotoCarouselWidget: Inserting new photo %s to Carousel.", photo);
                // update page
                this.dataPage.insertPhoto(photo);
                var from = this.dataPage.getLocalIndexOfPhoto(photo);
                
                // Did we insert on the current page? Then we need to update it
                if (this._isLastPage()){
                   console.log("PhotoCarouselWidget: New photo is inserted on current page. Reload current page from index %d.", from);
                   this.currentPage = this.dataPage.getPage("current");
                   this._load(from, from + 1);
                } else if (this.options.navigateToInsertedPhoto) {
                   // config: Show newly inserted photos
                   this.currentPage = this.dataPage.getPage("last");
                   this._load();
                } else if (this.isStarted) { // Call _update to correct photo number, etc
                   this.options.onUpdate.call(this.options.context, $());
                }
                   
             },
             deletePhoto : function (photo) {
                assertTrue(photo instanceof Photo, "input parameter photo has to be model of the type Photo");

                // Deal with a quick succession of deletePhoto() calls.
                // This will merge the onFadeOut Handler with Timeout (with src present)  with the next one without timeout (without src present).
                // This does not work for several deletePhoto() calls where the src is not loaded.
                if (this._deleteThread !== null) {
                   this._deleteThread = function () {
                   };
                }

                var currentPage = this.dataPage.getPage("current"),
                    $currentItem = null,
                    // oldPage pages photo instances.
                    from = 0,
                    firstIndexOfCurrentPage = this._getIndexForPhoto(currentPage[0]),
                    index = this._getIndexForPhoto(photo),
                    localIndex = this.dataPage.getLocalIndexOfPhoto(photo),
                    instance = this,
                    onFadeOut = function () {
                       this.currentPage = this.dataPage.getPage("current");
                       // Update everything from and including the deleted photo element.
                       this._load(from);
                       instance._deleteThread = null;
                    };


                this.dataPage.deletePhoto(photo);

                // Did we delete on the current page?
                if (localIndex !== -1 ) {
                   $currentItem = this.$photos.eq(localIndex);
                      
                   $currentItem.fadeOut(500, function () {
                      $(this)
                         .removeAttr("src")
                         .removeAttr("data-keiken-id");
                      // Refresh everything and including the delete photo element.
                      from = localIndex;
                      onFadeOut.apply(instance);
                   });
                   this._deleteThread = onFadeOut;
                }  else if (index < firstIndexOfCurrentPage) {  // Did we delete from a previous page?
                   // Refresh the whole page.
                   // Everything is moving to the left.
                   from = 0;
                   this._deleteThread = onFadeOut;
                   onFadeOut.apply(instance);
                } else if (this.isStarted) { // Call _update to correct photo number, etc
                   this.options.onUpdate.call(this.options.context, $());
                }
             },
             /**
              * @description Destroys this instance. Use this to stop all running threads.
              * Hides all photos and removes the src attribute. Also hides all loaders.
              * Note: Makes this instance unusable. It has to be discarded immediatly afterwards.
              */
             destroy : function () {
                console.log("PhotoCarouselWidget: Destroying. Stopping update all threads.");
                this.dataPage = null;
                this.currentPage = null;
                this.nLoadHandler = 0;
                this.$photos.each(function () {
                   $(this).hide().removeAttr("src");
                });
                this.options.loader.each(function () {
                   $(this).hide();
                });
                this.options = null;
                this.$photos = null;
             },
             /* 
              * @public
              * @description Navigates only if necessary.
              * @param {String | Photo} to
              */
             navigateTo : function (to) {
                this.isStarted = true;
                // assert(this.isStarted, true, "carousel has to be started already");
                switch(typeof to) {
                case "string":
                   assertTrue((to === "start") || (to === "end"), "Parameter to can only be one of 'start' or 'end'.");
                   break;
                case "object" :
                   to = this.dataPage.getPageIndex(to);
                   // The photo is on the current page. Do nothing.
                   if (to === this.dataPage.getCurrentPageIndex()) {
                      return;
                   }
                   assertTrue(to >= 0, "Photo must be a legal index.");
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
             /**
              * @private
              */
             _isLastPage : function () {
                return this.dataPage.isLastPage();
             },
             /**
              * @public
              */
             //TODO rename this to getImageSources().
             getAllImageSources : function () {
                return this.dataPage.getAllImageSources();
             },
             /**
              * @public
              */
             //TODO rename this to getPhotos().
             getAllPhotos : function () {
                return this.dataPage.getAllPhotos();
             },
             /**
              * @private
              */
             _getIndexForPhoto : function (photo) {
                return this.getAllPhotos().indexOf(photo);
             },
             /*
              * @public
              * @returns {Photo} If src present, null otherwise.
              */
             // getPhotoForSrc : function (src) {
             //    assertString(src, "src must be of type string.");
             //    var photo = null,
             //        photoIndex = 0,
             //        photos = this.getAllPhotos();
             //    for (photoIndex = 0; photoIndex < photos.length; photoIndex++) {
             //       photo = photos[photoIndex];
             //       if (photo[this.srcPropertyName] === src) {
             //          return photo;
             //       }
             //    }
             //    return null;
             // },
                
             /**
              * @private
              * @description Loads all photos, or just current page depending on this.options.lazy (=true/false). 
              * When everything is loaded, this.options.onLoad (optional) is executed and the carousel is updated to show the current page.
              * @param {int} from: Index of the first photo element to update. Default is 0. 
              * @param {int} to: Index of the last photo element to update. Defaults to the length of the current Page
              * This can be used when items get deleted in the middle of the page. The last elements would be ignored without the to parameter.
              */
             _load : function (from, to) {
                // Storing photos.length in an temporary variable will corrupt the loading/update process.
                // It is possible that the photos array will be modified concurrently and the length changes.
                var loader, 
                    photoIndex = 0,
                    loadHandler = null,
                    errorHandler = null,
                    // Counts the photo already loaded.
                    loaded = 0, 
                    currentPage = null,
                    photo = null,
                    photos = null,
                    photoErrors = [],
                    instance = this;

                if (from === undefined || from === null) {
                   from = 0;
                }

                if (to === undefined || to === null) {
                   to = this.size;
                }

                if (this._loadThread !== null) {
                   this._loadThread = function () {};
                }

                // Only load current page.
                //TODO this should only load pictures from index 'from' , if specified
                if (this.options.lazy) {
                   // Filter out null values of the current page.
                   // Photo elements with null srcs will never trigger the load event.
                   photos = this.currentPage.slice(from, to).filter(function (e, i) {
                      return e !== null;
                   });
                } else { // Load all photos.
                   photos = this.getAllPhotos();
                }
                // Remove old network error warnings.
                this.$photos.slice(from, to).removeClass("mp-photo-network-error");

                console.log("PhotoCarouselWidget: Preparing to update from %d to %d.", from, to);

                /*
                 * This thread will be executed every time a photo is loaded.
                 * Once all photos are loaded, it will trigger the _update function.
                 * If more than one thread is running at the same time, the last thread will update all photo elements.
                 * This thread could be executed after the carousel has been garbage collected.
                 * Protect everything with a try-catch clause.                 
                 */
                loadHandler = function () {
                   try {
                      ++loaded;

                      if (loaded >= photos.length) {
                         // This threat is the last active threat -> If there were multiple threats during the creation time, then it must update the whole page.
                         if (instance.nLoadHandler === 1) {
                            instance.nLoadHandler = 0;
                            console.log("PhotoCarousel: Last update threat. Calling _update.");
                            // Trigger the afterLoad event.
                            instance.options.afterLoad.call(instance.options.context, instance.$photos.slice(from, to));
                            // Mark the photo element that srcs could not be loaded
                            // They will be excluded from _update.
                            photoErrors.forEach(function (photoIndex) {
                               instance.$photos.get(photoIndex).addClass("mp-photo-network-error");
                            });
                            // There are other loadHandler running, loading other photos.
                            // This could lead to flickering, because the current page is updated more than once.
                            // The solution: Only call update once and ignore from and to.
                            if (instance._loadThreadWaiting) {
                               instance._loadThreadWaiting = false;
                               console.log("PhotoCarouselWidget: Ignoring to and from. Updating from %d to %d.", 0, instance.$photos.length);
                               instance._update(0, instance.$photos.length);
                            } else {
                               // Start updating the srcs.
                               console.log("PhotoCarouselWidget: Starting to update from %d to %d.", from, to);
                               instance._update(from, to);                  
                            }
                         } else {
                            // Make sure to free the locked resources.
                            instance._loadThread = null;
                            instance.nLoadHandler -= 1;
                            instance._loadThreadWaiting = true;
                            console.log("PhotoCarouselWidget: Not the last update threat. Waiting for other update threats.");
                         }
                      }
                   } catch (e) {
                      console.log("PhotoCarouselWidget: Could not count loaded photos. Maybe the carousel was reset?");
                      console.dir(e);
                      // Free resources, in case the thread dies unexpectedly.
                      if (instance._loadThread !== null) {
                         instance._loadThread = null;
                         instance.nLoadHandler -= 1;
                      }
                   }
                };

                /*
                 * This thread will be executed every time an error occurs while loading a photo.
                 * It will store the index of the photo element that src could not be loaded.
                 * This thread operates only on local variables and can never fail.
                 */
                errorHandler = function () {
                   loaded++;
                   var photoIndex = parseInt($(this).attr("data-keiken-index"));
                   assertNumber(photoIndex, "Every anonymous img element must have the attribute data-keiken-index.");
                   photoErrors.push(photoIndex);
                };
                   
                // Count the number of update threads running in paralell.
                this.nLoadHandler += 1;

                /*
                 * This thread will load the photos into anonymous image elements.
                 * It will call the loadHandler every time a photo is loaded or an error occurs.
                 * This thread could be executed after the carousel has been garbage collected.
                 * Protect everything with a try-catch clause.                 
                 */
                loader = function () {
                   try {
                      // Length could change in the meantime, do not store this in an intermediate variable.
                      // There are no photos and nothing to load, but the afterLoad event still needs to be triggered.
                      if (photos.length === 0) {
                         instance.options.afterLoad.call(instance.options.context, instance.$photos.slice(from, to));
                         // Update an empty set to trigger all other events properly too.
                         instance._update();
                      }
                      // Length could change in the meantime, do not store this in an intermediate variable.
                      for (photoIndex = 0; photoIndex < photos.length; photoIndex++) {
                         // This will throw an error if the instance was garbage collected or reset().
                         instance._ping();
                         photo = photos[photoIndex];
                         $('<img/>')
                            .load(loadHandler)
                            .error(loadHandler)
                            .attr('src', photo.getSource(instance.srcPropertyName))
                            .attr('data-keiken-id', photo.getId());
                        
                         console.log("PhotoCarouselWidget: Setting src %s on anonymous img element.", photo.getSource(instance.srcPropertyName));
                      }
                   } catch (e) {
                      console.log("Could not prepare photos for loading. Maybe the carousel was reset?");
                   }
                };
                
                // Starts the fadeout animation and the load Thread afterwards.
                carouselAnimation.start({
                   items: instance.$photos.slice(from, to),
                   loader: this.options.loader,
                   animation: this.options.effect,
                   animationTime: this.options.duration,
                   onStart : loader
                });


                // Trigger the beforeLoad event.
                this.options.beforeLoad.call(this.options.context, this.$photos.slice(from, to));

                // This is called at startup when there are no photos present or after all photos are deleted.
                if (photos.length === 0){
                   this.options.afterLoad.call(this.options.context, this.$photos.slice(from, to));
                   this.options.onUpdate.call(this.options.context, this.$photos.slice(from, to));
                }
                
                this._loadThread = loadHandler;
             },
             /**
              * @description Updates carousel to show current page.
              * @param {int} from: The index of the first photo that gets updated. Default is 0
              */
             //TODO this i called even when not all photo could be loaded (e.g network error)
             // we need to indicate that a photo could not be loaded
             _update : function (from, to) {
                if (this._finishThread !== null) {
                   this._finishThread = function () {};
                }
                
                var instance = this,
                    photos = [],
                    $photos = this.$photos
                       .slice(from, to)
                // Don't update photo elements which srcs could not be loaded.
                       .filter(function () {
                          return !$(this).hasClass("mp-photo-network-error");
                       }),
                    finishHandler = null;

                assertTrue($photos.size() > 0, "$photos has to contain at least one item");
                // Include null values to allow gaps between photos.
                photos = this.currentPage.slice(from, to);
                
                // This threat could be executed after the carousel has been garbage collected.
                // Protect everything with a try-catch clause.
                finishHandler = function ($photos) {
                   try { 
                      $photos.each(function (photoIndex, photoNode) {
                         // This makes it possible to identify the photo by only looking at the img tag. The src of a photo must not be unique.
                         var photo = photos[photoIndex];
                         if (photo) {
                            $(photoNode).attr(instance.ID_HTML_ATTRIBUTE, photos[photoIndex].getId());
                         } else {
                            $(photoNode).removeAttr(instance.ID_HTML_ATTRIBUTE);
                         }
                      });
                      instance.options.onUpdate.call(instance.options.context, $photos);
                   } catch (e) {
                      console.log("Could not finish the animation. Maybe the carousel has been reset");
                   }
                };

                carouselAnimation.end({
                   items: $photos,
                   "photos": photos,
                   srcPropertyName: this.srcPropertyName,
                   loader: this.options.loader,
                   animation: this.options.effect,
                   animationTime: this.options.duration,
                   onEnd: finishHandler,
                   context: instance.options.context
                });

                this._finishThread = finishHandler;
             },
             /*
              * @private
              * @description Test if this instance is not reset or garbage collected.
              * This is sometimes necessary in threads that do not access class members, but only modify the Dom.
              * This will raise an error, if the instance was taken down and will terminate the threads.
              */
             _ping : function () {
                console.log("PhotoCarouselView: _ping");
                this.$photos.length * 2;
             },
          });
       });
   