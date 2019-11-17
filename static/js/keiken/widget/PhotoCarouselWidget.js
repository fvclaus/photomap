
"use strict"

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
  "../widget/_DomTemplatedWidget",
  "../util/PhotoPages",
  "../util/CarouselAnimation",
  "dojo/text!./templates/PhotoCarousel.html"],
function (declare, lang, _DomTemplatedWidget, PhotoPages, CarouselAnimation, templateString) {
  return declare(_DomTemplatedWidget, {
    ID_DATA_ATTRIBUTE: "data-keiken-id",
    viewName: "PhotoCarouselWidget",
    templateString: templateString,
    // eslint-disable-next-line no-unused-vars
    constructor: function (params, srcNodeRef) {
      assertTrue(params.photosPerPage > 0)

      this.options = $.extend({}, {
        effect: "fade",
        duration: 500,
        // No need to check for the existence of these functions.
        beforeLoad: function () {},
        afterLoad: function () {},
        onUpdate: function () {},
        navigateToInsertedPhoto: false,
        context: this,
        loaderType: "light"
      }, params)

      this.srcPropertyName = params.srcPropertyName
      this._numberOfLoadHandlersActive = 0

      this.dataPage = new PhotoPages(params.photos, params.photosPerPage, this.srcPropertyName)
      this._templateContextPhotosPerPageArray = new Array(params.photosPerPage)
    },
    buildRendering: function () {
      this.inherited(this.buildRendering, arguments)
      this.$photos = this.$container.find(".mp-carousel-photo")
      this.$loader = this.$container.find(".mp-carousel-photo-loader")
    },
    _bindListener: function () { },
    update: function (photos) {
      this.dataPage = new PhotoPages(photos, this.dataPage.photosPerPage)
      if (this._started) {
        this.loadCurrentPage()
      }
    },
    /**
      * @description Starts the carousel by loading the first or the requested page
      * @idempotent
      */
    startup: function (photo) {
      if (this._started) {
        return
      }
      this.inherited(this.startup, arguments)
      if (photo) {
        this.dataPage.navigateTo(photo)
      }
      this.loadCurrentPage()
    },
    /*
     * @public
     * @description Navigates only if necessary.
     * @param {Number | Photo} to
     */
    navigateTo: function (to) {
      switch (typeof to) {
        case "object" :
          to = this.dataPage.getPageIndex(to)
          assertTrue(to >= 0, "Photo must be a legal index.")
          break
        case "number" :
          assertTrue(to < this.dataPage.getNPages(), "PageIndex must be legal index")
          break
        default:
          throw new Error("Unknown type " + typeof to)
      }
      this.dataPage.navigateTo(to)
      this.loadCurrentPage()
    },

    navigateLeft: function () {
      this.dataPage.navigateTo("previous")
      this.loadCurrentPage()
    },
    navigateRight: function () {
      this.dataPage.navigateTo("next")
      this.loadCurrentPage()
    },
    getNPages: function () {
      return this.dataPage.getNPages()
    },
    getCurrentPageIndex: function () {
      return this.dataPage.getCurrentPageIndex()
    },
    loadCurrentPage: function () {
      var photos = this.dataPage.getCurrentPageWithoutPadding()

      if (photos.length === 0 && this._numberOfLoadHandlersActive === 0) {
        this.options.beforeLoad.call(this.options.context, this.$photos)
        this.options.afterLoad.call(this.options.context, this.$photos)
        this._update()
      } else {
        console.log("PhotoCarouselWidget: Preparing to update")

        var loaded = 0

        var photoLoaded = function () {
          try {
            ++loaded

            if (loaded >= photos.length) {
              this._numberOfLoadHandlersActive--
              // There may be more than one handler active at any given time (if navigateToXX/insert/delete was triggered in quick succession)
              if (this._numberOfLoadHandlersActive === 0) {
                console.log("PhotoCarousel: Last update threat. Calling _update.")
                this.options.afterLoad.call(this.options.context, this.$photos)
                console.log("PhotoCarouselWidget: Starting to update")
                this._update()
              } else {
                console.log("PhotoCarouselWidget: Not the last update handler.")
              }
            }
          } catch (e) {
            console.log("PhotoCarouselWidget: Could not count loaded photos. Maybe the carousel was reset?")
            console.dir(e)
          }
        }.bind(this)

        this._numberOfLoadHandlersActive++

        // Fadeout photos and load next photos afterwards.
        new CarouselAnimation().start({
          items: this.$photos,
          loader: this.$loader,
          animation: this.options.effect,
          animationTime: this.options.duration,
          complete: function () {
            try {
              photos.forEach(function (photo) {
                // Load photos into anonymous image to bring them into the browser cache.
                // Call photoLoaded for every photo on success or failure
                $("<img/>")
                  .load(lang.hitch(this, photoLoaded))
                  .error(lang.hitch(this, photoLoaded))
                  .attr("src", photo.getSource(this.srcPropertyName))

                console.log("PhotoCarouselWidget: Setting src %s on anonymous img element.", photo.getSource(this.srcPropertyName))
              }.bind(this))
            } catch (e) {
              console.log("Could not prepare photos for loading. Maybe the carousel was reset?")
              console.dir(e)
            }
          }.bind(this)
        })

        // Trigger the beforeLoad event.
        this.options.beforeLoad.call(this.options.context, this.$photos)
      }
    },
    /**
      * @description Updates carousel to show current page.
      */
    _update: function () {
      var photos = this.dataPage.getCurrentPage()

      new CarouselAnimation().end({
        items: this.$photos,
        photos: photos,
        srcPropertyName: this.srcPropertyName,
        loader: this.$loader,
        animation: this.options.effect,
        animationTime: this.options.duration,
        complete: function () {
          try {
            this.$photos.each(function (photoIndex, photoNode) {
              // This makes it possible to identify the photo by only looking at the img tag. The src of a photo must not be unique.
              var photo = photos[photoIndex]
              // Not every page is full
              if (photo) {
                $(photoNode).attr(this.ID_DATA_ATTRIBUTE, photo.getId())
              } else {
                $(photoNode).removeAttr(this.ID_DATA_ATTRIBUTE)
              }
            }.bind(this))
            this.options.onUpdate.call(this.options.context, this.$photos)
          } catch (e) {
            console.log("Could not finish the animation. Maybe the carousel has been reset")
          }
        },
        context: this.options.context
      })
    }
  })
})
