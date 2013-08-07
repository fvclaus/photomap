/*jslint sloppy : true*/
/*global $, define, window, assertInstance, assertFunction, assert, assertTrue, gettext */

// No use strict with this.inherited(arguments);
// "use strict";

/**
 * @author Marc Roemer
 * @description Displays current slideshow-image as fullscreen, supports zooming into the image
 */
define(["dojo/_base/declare",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "view/View",
        "view/PhotoCarouselView",
        "model/Photo", 
        "util/Communicator", 
        "util/Tools",
        "dojo/domReady!"], 
       function (declare, _WidgetBase, _TemplatedMixin, View, PhotoCarouselView, Photo, communicator, tools, template) {
          return declare([View, _WidgetBase, _TemplatedMixin], {
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
                assertFunction(this._bindListener, "Every PhotoWidget must define a _bindListener function");
                assertString(this.viewName, "Every PhotoWidget must define a viewName");
             },
             /*
              * @public
              * @description Part of the dijit widget lifecycle. Gets called before the dom is ready. Converts the standard dom element attach points to jquery element attach points. Declare your selectors with data-dojo-attach-point=exampleNode to access them as this.$example after buildRendering().
              * The dijit domNode member will be converted to $container. $container will be the root element of your widget.
              */
             buildRendering : function () {
                this.inherited(arguments);
                var instance = this;
                this._attachPoints.forEach(function (attachPoint) {
                   var jQSelectorName = "$" + attachPoint.replace("Node", "");
                   instance[jQSelectorName] = $(instance[attachPoint]);
                });
                this.$container = $(this.domNode);
             },
             /*
              * @public
              * @description Part of the dijit widget lifecycle. This must be called by hand. The dom is already present. Every PhotoWidget must at least define _carouselOptions and _srcPropertyName by the time this startup function is called.
              */
             startup : function () {
                if (this._started) {
                   return;
                }
                assertObject(this.$photos, "Every PhotoWidget must define the image elements for the PhotoCarousel");
                assertObject(this._carouselOptions, "Every PhotoWidget must define options for the PhotoCarousel");
                assertString(this._srcPropertyName,  "Every PhotoWidget must define its srcPropertyName");
                this.inherited(arguments);
                // Prevent the (this.carousel === null) clause from failing because this.carousel is undefined.
                this.carousel = null;
                // Use this widget with the keyboard.
                this._bindActivationListener(this.$container, this.viewName);
                this._bindListener();
             },
             /*
              * @public
              * @description Initiates the PhotoCarouselView. This will not display any photos, it just makes this widget ready to receive insert/deletePhoto events.
              */
             load : function (photos) {
                assertInstance(photos, Array, "Photos must be of type Array.");
                assert(this._started, true, "Must call startup() before.");
                // Resets to state after startup().
                this.reset();
                this._loaded = true;

                this.carousel = new PhotoCarouselView(this.$photos, photos, this._srcPropertyName, this._carouselOptions);
             },
             /*
              * @public
              * @description Reset must be implemented by PhotoWidgets. It must reset the widget to the state the widget was in after calling startup() and before load()
              */
             reset : null,
             /**
              * @public
              * @description Starts widget by starting the carousel. No problems if the photos are empty.
              * @param {Photo} photo: Null to start with the first photo.
              */
             run: function (photo) {
                assert(this._started, true, "Must call startup() before.");
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
             },

          });
       });
