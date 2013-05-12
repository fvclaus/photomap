/*jslint */
/*global $, define, main, window, assert, assertTrue, assertString */

"use strict";

/**
 * @author Frederik Claus, Marc-Leon Römer
 * @class creates an infinite carousel (for images) with given data using DataPage.
 * @requires DataPage
 */
/**
 * @author Frederik Claus
 * @description defines handler to initialize and navigate through the carousel and to load images (supports lazy-loading)
 * @note every callback will be called everytime no matter if there is something to load/update or not
 * @param options.beforeLoad Called before the photos are loaded
 * @param options.afterLoad Called after all photos are loaded (successful or not)
 * @param options.onUpdate Called after all photos are updated
 */
  
define(["dojo/_base/declare", "view/View", "model/Photo", "util/PhotoPages", "util/Tools", "util/CarouselAnimation"], 
       function (declare, View, Photo, PhotoPages, tools, carouselAnimation) {
          
          return declare (View, {
             constructor : function ($photos, photos, srcPropertyName, options) {
                assertTrue($photos.size() > 0, "Can't build a Carousel without placeholder for photos.");
                
                photos.forEach(function (photo) {
                   assertTrue(photo instanceof Photo);
                   assertString(photo[srcPropertyName]);
                });

                this.defaults = {
                   lazy : false,
                   effect : "fade",
                   duration: 500,
                   context : this,
                };
                this.options = $.extend({}, this.defaults, options);
                this.srcPropertyName = srcPropertyName;
                
                this.$items = $photos;
                // recalculate margins when window is resized
                $(window).resize(function () {
                   $photos.each(function () {
                      main.getTools().centerElement($(this), "vertical");
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
              */
             start : function (index) {
                
                this.isStarted = true;
                if (index) {
                   this.navigateTo(index);
                   this.currentPageIndex = index;
                } else {
                   this.currentPage = this.dataPage.getPage("first");
                   this.currentPageIndex = 0;
                   this._load();
                }
             },
             insertPhoto : function (photo) {
                assertTrue(photo instanceof Photo);
                
                console.log("UIPhotoCarousel: Inserting new photo %s to Carousel.", photo);
                // update page
                this.dataPage.insertPhoto(photo);
                var from = this.dataPage.getIndexOfPhoto(photo);
                
                // Did we insert on the current page? Then we need to update it
                if (this.isLastPage()){
                   console.log("UIPhotoCarousel: New photo is inserted on current page. Reload current page from index %d.", from);
                   this.currentPage = this.dataPage.getPage("current");
                   this._load(from);
                }
             },
             deletePhoto : function (photo) {
                assertTrue(photo instanceof Photo);

                var instance = this, 
                    oldPage = this.dataPage.getPage("current"),
                    // the oldPage consists of sources
                    from = oldPage.indexOf(photo[this.srcPropertyName]);

                this.dataPage.deletePhoto(photo);

                // Did we delete on the current page?
                if (from !== -1) {
                   this.$items
                      .filter("img[src='" + photo[this.srcPropertyName] + "']")
                      .fadeOut(500, function () {
                         $(this).attr("src", null);
                         instance.currentPage = instance.dataPage.getPage("current");
                         // we need to update everything from 'from' to the last entry of the oldPage
                         //TODO get the real length of the oldPage, currently this will always be this.size
                         instance._load(from, oldPage.length);
                      });
                }
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
             navigateTo : function (to) {
                assert(this.isStarted, true, "carousel has to be started already");

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
             /**
              * @description Loads all photos, or just current page depending on this.options.lazy (=true/false). 
              * When everything is loaded this.options.onLoad (optional)  is executed and the carousel is updated to show the current page.
              * @param {int} from Index of the first photo element to update. Default is 0. 
              * @param {int} to Index of the last photo element to update. Defaults to the length of the current Page
              * This can be used when items get deleted in the middle of the page. The last elements would be ignored without the to parameter.
              */
             _load : function (from, to) {
                var i, j, loader, loadHandler, loaded, maxLoad, currentPage, source, instance = this, imageSources, nSources;
                loaded = 0;

                if (from === undefined || from === null) {
                   from = 0;
                }

                // only load current page
                //TODO this should only load pictures from index 'from' , if specified
                if (this.options.lazy) {
                   // filter current page to get the actual amount of images
                   imageSources = this.currentPage.filter(function (e, i) {
                      return e !== null;
                   });
                   // regardless of whats actually on a page, we must update all entries to remove the old ones
                   to = this.size;
                // load everything
                } else {
                   imageSources = this.getAllImageSources();
                }
                // handler is called after all images are loaded
                loadHandler = function () {
                   ++loaded;

                   if (loaded === nSources) {
                      // if there is a load-handler specified in the options, execute it first
                      if (typeof instance.options.afterLoad === "function") {
                         // trigger the afterLoad event
                         instance.options.afterLoad.call(instance.options.context, instance.$items.slice(from, to || nSources));
                      }
                      // start updating the srcs
                      instance._update(from, to || nSources);
                   }
                };
                nSources = imageSources.length;
                loader = function () {
                   for (i = 0; i < nSources; i++) {
                      source = imageSources[i];
                      console.log(source);
                      $('<img/>')
                         .load(loadHandler)
                         .error(loadHandler)
                         .attr('src', source);
                   }
                }
                carouselAnimation.start({
                   items: instance.$items,
                   loader: this.options.loader,
                   animation: this.options.effect,
                   animationTime: this.options.duration,
                   onStart : loader
                });

                if (typeof this.options.beforeLoad === "function") {
                   // trigger the beforeLoad event
                   this.options.beforeLoad.call(this.options.context, this.$items.slice(from, to || nSources));
                }
                // this is called at startup when there are no photos present or after all photos are deleted
                if (nSources === 0){
                   if (typeof this.options.afterLoad === "function") {
                      this.options.afterLoad.call(this.options.context, this.$items.slice(from, to || nSources));
                   }
                   if (typeof this.options.onUpdate === "function") {
                      this.options.onUpdate.call(this.options.context, this.$items.slice(from, to || nSources));
                   }
                }
             },
             /**
              * @description Updates carousel to show current page.
              * @param {int} from: The index of the first photo that gets updated. Default is 0
              */
             //TODO this i called even when not all photo could be loaded (e.g network error)
             // we need to indicate that a photo could not be loaded
             _update : function (from, to) {
                
                var instance = this, 
                    imageSources = [],
                    $items = this.$items.slice(from, to);
                    
                assertTrue($items.size() > 0, "$items has to contain at least one item");
                
                $items.each(function (index) {
                   imageSources.push(instance.currentPage[from + index] || "");
                });
                
                carouselAnimation.end({
                   items: $items,
                   images: imageSources,
                   loader: this.options.loader,
                   animation: this.options.effect,
                   animationTime: this.options.duration,
                   onEnd: instance.options.onUpdate,
                   context: instance.options.context
                });
             }
          });
       });
   