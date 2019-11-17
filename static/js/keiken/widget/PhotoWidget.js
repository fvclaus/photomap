"use strict"

/**
 * @author Frederik Claus
 * @description Base class for all widgets displaying photos. It defines and enforces certain API conventions that all photo widgets must follow. It is up to the widget to display photos on one page or multiple pages.
 * @see MultiplePagesPhotoWidget
 */
define(["dojo/_base/declare",
  "./Widget",
  "./PhotoCarouselWidget",
  "../model/Collection",
  "../model/Photo",
  "dojo/domReady!"],
function (declare, Widget, PhotoCarouselWidget, Collection, Photo) {
  return declare([Widget], {
    /**
      * @public
      * @description PhotoWidgets must expose a certain number of function. The constructor will check if they have been defined in the child class.
      */
    constructor: function () {
      assertSchema({
        _onCarouselUpdate: assertFunction,
        reset: assertFunction
      }, this)
    },
    /**
      * @public
      * @description Part of the dijit widget lifecycle. This must be called by hand. The dom is already present. Every PhotoWidget must at least define _carouselOptions and _srcPropertyName by the time this startup function is called.
      * @idempotent
      */
    startup: function () {
      if (this._started) {
        return
      }
      assertSchema({
        _carouselOptions: assertObject,
        _photosPerPage: assertNumber,
        _srcPropertyName: assertString,
        _onCarouselUpdate: assertFunction
      }, this)
      // Widget will call _bindListener.
      this.inherited(this.startup, arguments)
      // Use this widget with the keyboard.
      this._bindActivationListener(this.$container, this.viewName)
      this.carousel = new PhotoCarouselWidget({
        srcPropertyName: this._srcPropertyName,
        photosPerPage: this._photosPerPage,
        onUpdate: this._onCarouselUpdate,
        beforeLoad: this._beforeCarouselLoad ? this._beforeCarouselLoad : null,
        afterLoad: this._afterCarouselLoad ? this._afterCarouselLoad : null
      }, this.carouselNode)
    },
    /**
      * @public
      * @description Initiates the PhotoCarouselView. This will not display any photos, it just makes this widget ready to receive insert/deletePhoto events.
      */
    load: function (photos) {
      assertInstance(photos, Collection, "Photos must be of type Collection.")
      assert(this._started, true, "Must call startup() before.")
      // Resets to state after startup().
      this.reset()
      this._loaded = true
      if (this._photos) {
        this._photos.removeEvents(this.viewName, "inserted")
        this._photos.removeEvents(this.viewName, "deleted")
      }
      this._photos = photos

      photos.onInsert(this.insertPhoto, this, this.viewName)
      photos.onDelete(this.deletePhoto, this, this.viewName)
    },
    /**
      * @public
      * @description Reset must be implemented by PhotoWidgets. It must reset the widget to the state the widget was in after calling startup() and before load()
      * @idempotent
      */
    reset: null,
    /**
      * @public
      * @description Starts widget by starting the carousel. No problems if the photos are empty.
      * @param {Photo} photo: Null to start with the first photo.
      * @idempotent
      */
    run: function (photo) {
      assertTrue(this._started, "Must call startup() before.")
      assertTrue(this._loaded, "Must call load(photos) before.")

      if (this._run) {
        return
      }
      this._run = true
      // initialize carousel
      this.carousel.startup(photo)
    },
    /**
      * @description Updates the widget with new photos. It will only refresh, if it has been started already.
      */
    update: function (photos) {
      this.carousel.update(photos)
    },
    /**
      * @public
      * @description Inserts a new Photo. This will not move the Carousel or do anything else.
      */
    insertPhoto: function (photo) {
      assertTrue(photo instanceof Photo, "input parameter photo has to be instance of Photo")
      assertTrue(this._loaded, "Must call load(photos) before.")
      this.carousel.loadCurrentPage()
    },
    /**
      * @public
      * @description Deletes an existing Photo. If Photo is the current Photo the previous Photo is shown.
      * If there is no previous Photo, nothing is shown.
      */
    deletePhoto: function (photo) {
      assertTrue(photo instanceof Photo, "input parameter photo has to be instance of Photo")
      assertTrue(this._loaded, "Must call load(photos) before.")
      this.carousel.loadCurrentPage()
    }
  })
})
