"use strict"

/**
 * @author Marc Roemer
 * @description Displays current slideshow-image as fullscreen, supports zooming into the image
 */
define(["dojo/_base/declare",
  "./_DomTemplatedWidget",
  "./PhotoCarouselWidget",
  "../model/Collection",
  "../util/Communicator",
  "dojo/text!./templates/Fullscreen.html",
  "dojo/domReady!"],
function (declare, _DomTemplatedWidget, PhotoCarouselWidget, Collection, communicator, templateString) {
  return declare([_DomTemplatedWidget], {
    templateString: templateString,

    viewName: "Fullscreen",

    startup: function () {
      if (this._started) {
        return
      }

      this.inherited(this.startup, arguments)

      this.carousel = new PhotoCarouselWidget({
        effect: "fade",
        srcPropertyName: "photo",
        photosPerPage: 1,
        loaderType: "dark",
        afterLoad: this._afterCarouselLoad,
        onUpdate: this._onCarouselUpdate,
        context: this
      }, this.carouselNode)

      this.disabled = true
    },
    load: function (photos) {
      assertInstance(photos, Collection, "Photos must be of type Collection.")
      assert(this._started, true, "Must call startup() before.")
      this._loaded = true
      this.carousel.load(photos)
    },
    show: function (photo) {
      this.carousel.navigateTo(photo)
      this.$container
        .show()
        .focus()
    },
    hide: function () {
      this.$container.hide()
    },
    destroy: function () {
      this.inherited(this.destroy, arguments)
      this.carousel.destroy()
    },
    // eslint-disable-next-line no-unused-vars
    _afterCarouselLoad: function ($photo, photos) {
      console.log("FullscreenWidget: _update")
      var photo = photos[0]
      // deleted last photo
      if (photo === null) {
        this.$title.empty()
      } else {
        this.$title.text(photo.title)
      }
    },
    _onCarouselUpdate: function () {
      communicator.publish("updated:Fullscreen")
    },
    _bindListener: function () {
      var navigateGallery = function (navigationFnName) {
        return function () {
          if (this.active) {
            this.carousel[navigationFnName]()
          }
        }.bind(this)
      }.bind(this)

      // carousel is undefined when listeners are registered.
      var navigateLeft = navigateGallery("navigateLeft")
      var navigateRight = navigateGallery("navigateRight")

      var instance = this
      this.$navLeft.on("click.Fullscreen", navigateLeft)
      this.$navRight.on("click.Fullscreen", navigateRight)

      this.$close.on("click.Fullscreen", function () {
        console.log("FullscreenWidget: close")
        instance.hide()
      })
      $("body")
        .on("keyup.Fullscreen", null, "esc", function () {
          if (instance.active) {
            this.hide()
            communicator.publish("closed:Fullscreen")
          }
        }.bind(this))
        .on("keyup.Fullscreen", null, "left", navigateLeft)
        .on("keyup.Fullscreen", null, "right", navigateRight)
    }
  })
})
