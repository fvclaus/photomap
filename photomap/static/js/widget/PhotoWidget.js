/*jslint sloppy : true*/
/*global $, define, window, assertInstance, assertFunction, assert, assertTrue, gettext */

// No use strict with this.inherited(arguments);
// "use strict";

/**
 * @author Frederik Claus
 * @description Base class for all widgets displaying photos. It defines and enforces certain API conventions that all photo widgets must follow.
 */
define(["dojo/_base/declare",
        "widget/Widget",
        "widget/PhotoCarouselWidget",
        "model/Collection",
        "model/Photo", 
        "util/Communicator", 
        "util/Tools",
        "dojo/domReady!"], 
       function (declare, Widget, PhotoCarouselView, Collection, Photo, communicator, tools, template) {
          return declare([Widget], {
             /*
              * @public
              * @description PhotoWidgets must expose a certain number of function. The constructor will check if they have been defined in the child class.
              */
             constructor : function () {
                assertFunction(this.load, "Every PhotoWidget must define a load function");
                assertFunction(this.run, "Every PhotoWidget must define a run function.");
                assertFunction(this.reset, "Every PhotoWidget must define a reset function");
                assertFunction(this.insertPhoto, "Every PhotoWidget must define a insertPhoto function.");
                assertFunction(this.deletePhoto, "Every PhotoWidget must define a deletePhoto function.");
             },
             /*
              * @public
              * @description Part of the dijit widget lifecycle. This must be called by hand. The dom is already present. Every PhotoWidget must at least define _carouselOptions and _srcPropertyName by the time this startup function is called.
              * @idempotent
              */
             startup : function () {
                if (this._started) {
                   return;
                }
                assertObject(this.$photos, "Every PhotoWidget must define the image elements for the PhotoCarousel");
                assertObject(this._carouselOptions, "Every PhotoWidget must define options for the PhotoCarousel");
                assertString(this._srcPropertyName,  "Every PhotoWidget must define its srcPropertyName");
                // Widget will call _bindListener.
                this.inherited(arguments);
                // Prevent the (this.carousel === null) clause from failing because this.carousel is undefined.
                this.carousel = null;
                // Use this widget with the keyboard.
                this._bindActivationListener(this.$container, this.viewName);
             },
             /*
              * @public
              * @description Initiates the PhotoCarouselView. This will not display any photos, it just makes this widget ready to receive insert/deletePhoto events.
              */
             load : function (photos) {
                assertInstance(photos, Collection, "Photos must be of type Collection.");
                assert(this._started, true, "Must call startup() before.");
                // Resets to state after startup().
                this.reset();
                this._loaded = true;
                this._photos = photos;
                
                photos.onInsert(this.insertPhoto, this);
                photos.onDelete(this.deletePhoto, this);
                this.carousel = new PhotoCarouselView(this.$photos, photos.getAll(), this._srcPropertyName, this._carouselOptions);
             },
             /*
              * @public
              * @description Reset must be implemented by PhotoWidgets. It must reset the widget to the state the widget was in after calling startup() and before load()
              * @idempotent
              */
             reset : null,
             /**
              * @public
              * @description Starts widget by starting the carousel. No problems if the photos are empty.
              * @param {Photo} photo: Null to start with the first photo.
              * @idempotent
              */
             run: function (photo) {
                assertTrue(this._started, "Must call startup() before.");
                assertTrue(this._loaded, "Must call load(photos) before.");

                if (this._run) {
                   return;
                }
                this._run = true;
                // initialize carousel
                this.carousel.start(photo);
             },
             /**
              * @public
              * @description Inserts a new Photo. This will not move the Carousel or do anything else.
              */
             insertPhoto : function (photo) {
                assertTrue(photo instanceof Photo, "input parameter photo has to be instance of Photo");
                assertTrue(this._loaded, "Must call load(photos) before.");
                // Slideshow might or might not be started at that point
                this.carousel.insertPhoto(photo);
             },
             /**
              * @public
              * @description Deletes an existing Photo. If Photo is the current Photo the previous Photo is shown.
              * If there is no previous Photo, nothing is shown.
              */
             deletePhoto : function (photo) {
                assertTrue(photo instanceof Photo, "input parameter photo has to be instance of Photo");
                assertTrue(this._loaded, "Must call load(photos) before.");
                // Slideshow might or might not be started at that point
                this.carousel.deletePhoto(photo);
             }
          });
       });
