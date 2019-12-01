"use strict"

/**
 * @author Marc Roemer
 * @class UISlideshow displays the current selected Photo in the Slideshow
 * @requires UICarousel UIFullscreen
 */

define(["dojo/_base/declare",
  "./_Widget",
  "./PhotoCarouselWidget",
  "../util/Communicator",
  "../model/Collection",
  "dojo/text!./templates/Slideshow.html",
  "./InfoTextWidget"],
function (declare, _Widget, PhotoCarouselWidget, communicator, Collection, templateString) {
  var navigateCarousel = function (navigationFnName) {
    return function () {
      if (this._run && this.active) {
        this.carousel[navigationFnName]()
        communicator.publish("opened:GalleryPage", this.carousel.getCurrentPageIndex())
      }
    }
  }

  return declare([_Widget], {
    templateString: templateString,

    viewName: "Slideshow",

    startup: function () {
      if (this._started) {
        return
      }
      this.inherited(this.startup, arguments)

      this.carousel = new PhotoCarouselWidget({
        effect: "fade",
        srcPropertyName: "photo",
        photosPerPage: 1,
        afterLoad: this._afterCarouselLoad,
        onUpdate: this._onCarouselUpdate,
        // eslint-disable-next-line no-unused-vars
        onPhotoClick: function ($photo, photo) {
          communicator.publish("clicked:SlideshowPhoto", photo)
        },
        context: this
      }, this.carouselNode)

      this._showNotStartedInfoText()
    },
    load: function (photos) {
      assertInstance(photos, Collection, "Photos must be of type Collection.")
      assertTrue(this._started, "Must call startup() before.")
      this._loaded = true
      this._unbindPhotoCollectionListener()
      this.carousel.load(photos)

      this._photos = photos
      var executeIfRun = function (fn) {
        return function () {
          if (this._run) {
            fn.apply(this, arguments)
          }
        }
      }
      photos.onInsert(executeIfRun(this.insertPhoto), this, this.viewName)
      photos.onDelete(executeIfRun(this.deletePhoto), this, this.viewName)
    },

    run: function (photo) {
      assertTrue(this._loaded, "Must call load() before.")
      this._run = true
      this.carousel.navigateTo(photo)
    },
    _unbindPhotoCollectionListener: function () {
      if (this._photos) {
        this._photos.removeEvents(this.viewName, "inserted")
        this._photos.removeEvents(this.viewName, "deleted")
        this._photos = null
      }
    },
    insertPhoto: function () {
      this._updatePhotoNumber()
    },
    deletePhoto: function (photo) {
      if (this._currentPhoto && photo.id === this._currentPhoto.id) {
        this.carousel.loadCurrentPage()
      } else {
        this._updatePhotoNumber()
      }
    },
    /*
     * @public
     * @description Navigates the slideshow left or right.
     * @param {String} direction: left || right
     */
    navigateWithDirection: function (direction) {
      assertTrue(direction === "left" || direction === "right", "slideshow can just navigate left or right")

      if (direction === "left") {
        this.carousel.navigateLeft()
      } else {
        this.carousel.navigateRight()
      }
    },
    /**
      * @presenter
      * @description Resets the slideshow
      * This will put the Slideshow in the state that it was after startup() was called.
      */
    reset: function () {
      this._loaded = false
      this._run = false
      this.carousel.reset()
      this._emptyPhotoNumber()
      this._showNotStartedInfoText()
    },
    _showNotStartedInfoText: function () {
      this._infoText
        .show({
          hideOnMouseover: false,
          message: gettext("SLIDESHOW_GALLERY_NOT_STARTED")
        })
    },
    /*
      * @presenter
      * @description Shows or hides information message, regarding the usage.
      */
    _updateInfoText: function (photo) {
      if (photo) {
        this._infoText.hide()
      } else {
        this._infoText.show({
          hideOnMouseover: true,
          message: gettext("SLIDESHOW_NO_PHOTOS")
        })
      }
    },
    // eslint-disable-next-line no-unused-vars
    _onCarouselUpdate: function ($photo, photos) {
      console.log("SlideshowWidget: _update")
      var photo = photos[0]
      this._currentPhoto = photo
      communicator.publish("updated:Slideshow", photo)
    },
    // eslint-disable-next-line no-unused-vars
    _afterCarouselLoad: function ($photo, photos) {
      var photo = photos[0]
      if (photo) {
        this._updatePhotoNumber()
      } else {
        this._emptyPhotoNumber()
      }
      this._updateInfoText(photo)
    },
    _updatePhotoNumber: function () {
      this.$photoNumber.text("Photo " + (this.carousel.getCurrentPageIndex() + 1) + "/" + this.carousel.getNPages())
    },
    _emptyPhotoNumber: function () {
      this.$photoNumber.text("")
    },
    _navigateLeft: navigateCarousel("navigateLeft"),
    _navigateRight: navigateCarousel("navigateRight")
  })
})
