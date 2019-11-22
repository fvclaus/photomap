"use strict"

/**
 * @author Marc Roemer
 * @class UIGallery shows a album-like thumbnail representation of all photos of a single place in the album
 * @requires UICarousel
 */
define(["dojo/_base/declare",
  "./_DomTemplatedWidget",
  "./PhotoCarouselWidget",
  "../util/Communicator",
  "../util/InfoText",
  "../model/Collection",
  "dojo/text!./templates/Gallery.html"],
function (declare, _DomTemplatedWidget, PhotoCarouselWidget, communicator, InfoText, Collection, templateString) {
  return declare(_DomTemplatedWidget, {
    VISITED_PHOTO_CLASSNAME: "mp-gallery-photo-visited",
    templateString: templateString,
    viewName: "Gallery",
    // eslint-disable-next-line no-unused-vars
    constructor: function (params, srcNodeRef) {
      this._isAdmin = !!params.adminMode
    },

    startup: function () {
      if (this._started) {
        return
      }
      this.inherited(this.startup, arguments)

      this.carousel = new PhotoCarouselWidget({
        effect: "flip",
        srcPropertyName: "thumb",
        photosPerPage: 5,
        onUpdate: this._onCarouselUpdate,
        beforeLoad: this._beforeCarouselLoad,
        afterLoad: this._afterCarouselLoad,
        onPhotoClick: function ($photo, photo) {
          if (photo) {
            $photo.addClass(this.VISITED_PHOTO_CLASSNAME)
            communicator.publish("clicked:GalleryPhoto", photo)
          } else if (this._isAdmin) {
            this._insert()
          }
        },
        onPhotoMouseenter: function ($photo, photo) {
          communicator.publish("mouseenter:GalleryPhoto", { contex: this, element: $photo, photo: photo })
        },
        onPhotoMouseleave: function ($photo, photo) {
          communicator.publish("mouseleave:GalleryPhoto", { context: this, element: $photo, photo: photo })
        },
        context: this
      }, this.carouselNode)

      this._infoText = new InfoText(this.$container, "")
      this._showNoPlaceSelectedInfoText()

      this.carousel.startup()
    },
    run: function (photos, photo) {
      assertInstance(photos, Collection, "Photos must be of type Collection.")
      assertTrue(this._started, true, "Must call startup() before.")

      this._unbindPhotoCollectionListener()
      this._run = true

      this.$insert.show()
      this.carousel.load(photos)
      if (photo) {
        this.carousel.navigateTo(photo)
      } else {
        this.carousel.loadCurrentPage()
      }

      this._photos = photos
      photos.onInsert(this.insertPhoto, this, this.viewName)
      photos.onDelete(this.deletePhoto, this, this.viewName)
    },
    insertPhoto: function (photo) {
      this.carousel.navigateTo(photo)
    },
    deletePhoto: function () {
      this.carousel.loadCurrentPage()
    },
    /**
     * @description Resets the Gallery to the state before start() was called. This will delete exisiting Photos.
     */
    reset: function () {
      this._run = false
      this.$insert.hide()
      this.carousel.reset()
      this._unbindPhotoCollectionListener()
      this._showNoPlaceSelectedInfoText()
    },
    _unbindPhotoCollectionListener: function () {
      if (this._photos) {
        this._photos.removeEvents(this.viewName, "inserted")
        this._photos.removeEvents(this.viewName, "deleted")
        this._photos = null
      }
    },
    destroy: function () {
      this.inherited(this.destroy, arguments)
      this.carousel.destroy()
    },
    navigateTo: function (photo) {
      // Navigate to photo, displaying it when the slideshow is started
      assertTrue(photo !== undefined, "Parameter photo must not be undefined.")
      this.carousel.navigateTo(photo)
    },
    isValidPage: function (page) {
      return page >= 0 && page < this.carousel.data.getNPages()
    },
    _beforeCarouselLoad: function ($photos) {
      $photos.removeClass(this.VISITED_PHOTO_CLASSNAME)
    },
    // eslint-disable-next-line no-unused-vars
    _afterCarouselLoad: function ($photos, photos) {
      if (photos.length > 0) {
        this._infoText.close()
      } else {
        this._infoText
          .setOption("hideOnMouseover", true)
          .setMessage(gettext(this._isAdmin ? "GALLERY_NO_PHOTOS_ADMIN" : "GALLERY_NO_PHOTOS_GUEST"))
          .open()
      }
    },
    _onCarouselUpdate: function ($photos, photos) {
      console.log("GalleryWidget: _update")
      // check each thumb if the photo it represents is already visited; if yes -> show 'visited' icon
      this._showVisitedNotification($photos, photos)
      communicator.publish("updated:Gallery")
    },
    _showNoPlaceSelectedInfoText: function () {
      this._infoText
        .setMessage(gettext("GALLERY_NO_PLACE_SELECTED"))
        .setOption("hideOnMouseover", false)
        .start()
        .open()
    },
    _showVisitedNotification: function ($photos, photos) {
      $.each($photos, function (index, photoEl) {
        var photo = photos[index]
        if (photo && photo.isVisited()) {
          $(photoEl).addClass(this.VISITED_PHOTO_CLASSNAME)
        } else {
          $(photoEl).removeClass(this.VISITED_PHOTO_CLASSNAME)
        }
      }.bind(this))
    },
    _bindListener: function () {
      var navigateGallery = function (navigationFnName) {
        return function () {
          if (this._run && this.active) {
            this.carousel[navigationFnName]()
            communicator.publish("opened:GalleryPage", this.carousel.getCurrentPageIndex())
          }
        }.bind(this)
      }.bind(this)

      // carousel is undefined when listeners are registered.
      var navigateLeft = navigateGallery("navigateLeft")
      var navigateRight = navigateGallery("navigateRight")

      this.$navLeft.on("click", navigateLeft)
      this.$navRight.on("click", navigateRight)

      $("body")
        .on("keyup.Gallery", null, "left", navigateLeft)
        .on("keyup.Gallery", null, "right", navigateRight)

      // the following events are not relevant for guests
      if (this._isAdmin) {
        this.$insert.on("click", this._insert.bind(this))
      }
    },
    _insert: function () {
      communicator.publish("clicked:GalleryInsert")
    }
  })
})
