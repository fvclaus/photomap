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
        "dojo/_base/lang",
        "../view/View",
        "../model/Photo",
        "../util/PhotoPages",
        "../util/Tools", 
        "../util/CarouselAnimation"], 
       function (declare, lang, View, Photo, PhotoPages, tools, CarouselAnimation) {
          
          return declare (View, {
             ID_HTML_ATTRIBUTE : "data-keiken-id",
             constructor : function ($photos, photos, srcPropertyName, options) {
                assertTrue($photos.size() > 0, "Can't build a Carousel without placeholder for photos.");
                
                photos.forEach(function (photo) {
                   assertTrue(photo instanceof Photo, "Only type Photo allowed.");
                   assertString(photo[srcPropertyName], "SrcProperty must be defined.");
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
                   context : this
                };
                
                this.carouselAnimation = new CarouselAnimation();
                this.options = $.extend({}, this.defaults, options);
                
                assertTrue(tools.countAttributes(this.options) === tools.countAttributes(this.defaults), "The options you defined seem to have more attributes than available.");
                this.srcPropertyName = srcPropertyName;
                this.nWaitForPhotosThreads = 0;
                
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
                if (this.isStarted) {
                   this.currentPage = this.dataPage.getPage("current");
                   this._load();
                }
             },
             /**
              * @description Starts the carousel by loading the first or the requested page
              * @param {Photo} photo: Null to start with the first photo.
              * @idempotent
              */
             start : function (photo) {
                assertTrue(photo !== null, "Photo parameter must not be null.");
                if (photo) {
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
                var from = this.dataPage.getLocalPhotoIndex(photo);
                
                // Did we insert on the current page? Then we need to update it
                if (!this.isStarted) {
                   console.log("PhotoCarouselWidget: Not started. Ignoring insert photo.");
                } else if (from !== -1){
                   console.log("PhotoCarouselWidget: New photo is inserted on current page. Reload current page from index %d.", from);
                   this._load(from, from + 1);
                } else if (this.options.navigateToInsertedPhoto) {
                   // config: Show newly inserted photos
                   this.currentPage = this.dataPage.getPage("last");
                   this._load();
                } else if (this.isStarted) { // Call _update to correct photo number, etc
                   this.options.onUpdate.call(this.options.context, $(), $());
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
                    localIndex = this.dataPage.getLocalPhotoIndex(photo),
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
                } else if (index < firstIndexOfCurrentPage && this.size === 1) { // If there is only one photo, don't move around. Although logical, it feels quite awkward to the end user.
                   this.options.onUpdate.call(this.options.context, $(), $());
                }  else if (index < firstIndexOfCurrentPage) {  // Did we delete from a previous page?
                   // Refresh the whole page.
                   // Everything is moving to the left.
                   from = 0;
                   this._deleteThread = onFadeOut;
                   onFadeOut.apply(instance);
                } else if (this.isStarted) { // Call _update to correct photo number, etc
                   this.options.onUpdate.call(this.options.context, $(), $());
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
                this.nWaitForPhotoThreads = 0;
                this.hasLoadPhotoInQueue = false;
                this.$photos.each(function () {
                   $(this).hide().removeAttr("src");
                });
                this.options.loader.each(function () {
                   $(this).hide();
                });
                this.options = null;
                this.$photos = null;
                this.carouselAnimation.destroy();
                this.carouselAnimation = null;
             },
             /* 
              * @public
              * @description Navigates only if necessary.
              * @param {Number | Photo} to
              */
             navigateTo : function (to) {
                this.isStarted = true;
                var isLoading = false,
                    currentPageIndex = this.dataPage.getCurrentPageIndex();
                switch(typeof to) {
                case "object" :
                   to = this.dataPage.getPageIndex(to);
                   assertTrue(to >= 0, "Photo must be a legal index.");
                   break;
                case "number" :
                   assertTrue(to < this.dataPage.getNPages(), "PageIndex must be legal index");
                   break;
                default: 
                   assertTrue(false, "Unknown type " + typeof to);
                   break;
                }
                // The photo is not on the current page or there is no current page yet (just started)
                if (to !== currentPageIndex || this.currentPage === null) {
                   this.currentPage = this.dataPage.getPage(to);
                   isLoading = true;
                   this._load();
                }

                return isLoading;
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
              * @public
              */
             getNPages : function () {
                return this.dataPage.getNPages();
             },
             /**
              * @public
              */
             getCurrentPageIndex : function () {
                return this.dataPage.getCurrentPageIndex();
             },
             /**
              * @private
              */
             _getIndexForPhoto : function (photo) {
                return this.getAllPhotos().indexOf(photo);
             },
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
                var photoIndex = 0,
                    loadPhotos = null,
                    photoNotLoaded = null,
                    photoLoaded = null,
                    // Counts the photo already loaded.
                    loaded = 0, 
                    currentPage = null,
                    photo = null,
                    photos = null,
                    photoErrors = [],
                    photoSuccess = [],
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
                 * This thread will be executed every time a photo is loaded or an network error occured.
                 * Once all photos are loaded, it will trigger the _update function.
                 * If more than one thread is running at the same time, the last thread will update all photo elements.
                 * This thread could be executed after the carousel has been garbage collected.
                 * Protect everything with a try-catch clause.                 
                 */
                photoLoaded = function (success, photoIndex) {
                   try {
                      ++loaded;
                      if (!success) {
                         // It is not possible to set the error attribute on the photo elment, because their might be several threads loading photos.
                         photoErrors.push(photoIndex);
                      } else {
                         photoSuccess.push(photoIndex);
                      }
                        
                      // The photo
                      if (loaded >= photos.length) {
                         // This threat is the last active threat -> If there were multiple threats during the creation time, then it must update the whole page.
                         if (instance.nWaitForPhotosThreads === 1) {
                            instance.nWaitForPhotosThreads = 0;
                            console.log("PhotoCarousel: Last update threat. Calling _update.");
                            // Trigger the afterLoad event.
                            instance.options.afterLoad.call(instance.options.context, instance.$photos.slice(from, to));
                            // Mark the photo element that srcs could not be loaded
                            // They will be excluded from _update.
                            photoErrors.forEach(function (photoIndex) {
                               instance.$photos.eq(photoIndex).attr("data-keiken-error", "network");
                            });
                            // It is necessary to remove old load errors from photo elements.
                            photoSuccess.forEach(function (photoIndex) {
                               instance.$photos.eq(photoIndex).removeAttr("data-keiken-error");
                            });
                            // There are other loadHandler running, loading other photos.
                            // This could cause flickering, because the current page is updated more than once.
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
                            instance.nWaitForPhotosThreads -= 1;
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
                         instance.nWaitForPhotosThreads -= 1;
                      }
                   }
                };

                   
                // Stop previous update cycle.
                // This will stop the update event from previous cycles. It will not stop the afterLoad event currently for problems described below.
                this.carouselAnimation.destroy();
                this.carouselAnimation = new CarouselAnimation();


                // There might or might no be another thread that is waiting for photo.load events.
                // Incrementing this counter will force the thread to wait with _update.
                // In theory there could be an unlimited number of paralell threads loading photos, if the connection is slow.
                this.nWaitForPhotosThreads += 1;

                /*
                 * This thread will load the photos into anonymous image elements.
                 * It will call the photoLoaded every time a photo is loaded or an error occurs.
                 * This thread could be executed after the carousel has been garbage collected.
                 * This must(!) not be interrupted, because if photos are inserted in quick succession new photo src will not be loaded properly. The loader for these photos will never be executed.
                 * TODO interrupt loadPhotos and add the photos to the new photo loader. @see test/MultiplePagesPhotoWidget.insertPhoto.
                 * Protect everything with a try-catch clause.               
                 */
                loadPhotos = function () {
                   try {
                      // Length could change in the meantime, do not store this in an intermediate variable.
                      // There are no photos and nothing to load, but the afterLoad event still needs to be triggered.
                      if (photos.length === 0) {
                         instance.options.afterLoad.call(instance.options.context, instance.$photos.slice(from, to));
                         // Update an empty set to trigger all other events properly too.
                         instance.nWaitForPhotosThreads -= 1;
                         instance._update();
                      } else { // The browser might or might not trigger a load event on photos that have the src null.
                         // Length could change in the meantime, do not store this in an intermediate variable.
                         for (photoIndex = 0; photoIndex < photos.length; photoIndex++) {
                            // This will throw an error if the instance was garbage collected or reset().
                            instance._ping();
                            photo = photos[photoIndex];
                            $('<img/>')
                               .load(lang.hitch(instance, photoLoaded, true, photoIndex))
                               .error(lang.hitch(instance, photoLoaded, false, photoIndex))
                               .attr('src', photo.getSource(instance.srcPropertyName));
                            
                            console.log("PhotoCarouselWidget: Setting src %s on anonymous img element.", photo.getSource(instance.srcPropertyName));
                         }
                      }
                   } catch (e) {
                      console.log("Could not prepare photos for loading. Maybe the carousel was reset?");
                      console.dir(e);
                   }
                };

                // Starts the fadeout animation and the load thread afterwards. This will start the load thread, even if the animation is interrupted.
                if (photos.length > 0) {
                   this.carouselAnimation.start({
                      items: instance.$photos.slice(from, to),
                      loader: this.options.loader.slice(from, to),
                      animation: this.options.effect,
                      animationTime: this.options.duration,
                      complete : loadPhotos
                   });
                }

                
                // Trigger the beforeLoad event.
                this.options.beforeLoad.call(this.options.context, this.$photos.slice(from, to));

                this._loadThread = photoLoaded;

                // This is called at startup when there are no photos present or after all photos are deleted.
                if (photos.length === 0){
                   this.options.afterLoad.call(this.options.context, this.$photos.slice(from, to));
                   if (this.nWaitForPhotosThreads === 1) {
                      this.nWaitForPhotosThreads = 0;
                      this.options.onUpdate.call(this.options.context, $(), $());
                   } else {
                      this.nWaitForPhotosThreads -= 1;
                      this._loadThreadWaiting = true;
                   }
                   this._loadThread = null;

                   // this.options.onUpdate.call(this.options.context, this.$photos.slice(from, to));
                }
             },
             /**
              * @description Updates carousel to show current page.
              * @param {int} from: The index of the first photo that gets updated. Default is 0
              */
             _update : function (from, to) {
                if (this._finishThread !== null) {
                   this._finishThread = function () {};
                }
                
                var instance = this,
                    $photos = this.$photos.slice(from, to),
                    photos = this.currentPage.slice(from, to),
                    photosWithoutError = [],
                    $photosWithoutError = $(),
                    $photosWithError = $(),
                    finishHandler = null;

                $photos.each(function (index) {
                   var photoIndex = index + from,
                       $photo = $(this);
                   if ($photo.attr("data-keiken-error") === undefined) {
                      photosWithoutError.push(instance.currentPage[photoIndex]);
                      $photosWithoutError = $photosWithoutError.add($photo);
                   } else {
                      $photosWithError = $photosWithError.add($photo);
                   }
                });

                assertTrue($photos.size() > 0, "$photos has to contain at least one item");

                
                // This threat could be executed after the carousel has been garbage collected.
                // Protect everything with a try-catch clause.
                finishHandler = function () {
                   try { 
                      // It is important that this loop iterates all $photos. Even those which could not be loaded.
                      $photos.each(function (photoIndex, photoNode) {
                         // This makes it possible to identify the photo by only looking at the img tag. The src of a photo must not be unique.
                         var photo = photos[photoIndex];
                         if (photo) {
                            $(photoNode).attr(instance.ID_HTML_ATTRIBUTE, photos[photoIndex].getId());
                         } else {
                            $(photoNode).removeAttr(instance.ID_HTML_ATTRIBUTE);
                         }
                      });
                      instance.options.onUpdate.call(instance.options.context, $photosWithoutError, $photosWithError);
                   } catch (e) {
                      console.log("Could not finish the animation. Maybe the carousel has been reset");
                   }
                };
                // Only show those $photos which srcs could be successfully loaded.
                this.carouselAnimation.end({
                   items: $photosWithoutError,
                   "photos": photosWithoutError,
                   srcPropertyName: this.srcPropertyName,
                   loader: this.options.loader,
                   animation: this.options.effect,
                   animationTime: this.options.duration,
                   complete: finishHandler,
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
                var a = this.$photos.length * 2;
             }
          });
       });
   