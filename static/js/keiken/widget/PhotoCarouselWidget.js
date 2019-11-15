
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
  "../model/Photo",
  "../util/PhotoPages",
  "../util/Tools",
  "../util/CarouselAnimation",
  "dojo/text!./templates/PhotoCarousel.html"],
function (declare, lang, _DomTemplatedWidget, Photo, PhotoPages, tools, CarouselAnimation, templateString) {
  return declare(_DomTemplatedWidget, {
    ID_DATA_ATTRIBUTE: "data-keiken-id",
    viewName: "PhotoCarouselWidget",
    templateString: templateString,
    // eslint-disable-next-line no-unused-vars
    constructor: function (params, srcNodeRef) {
      assertTrue(params.photosPerPage > 0)

      var defaults = {
        effect: "fade",
        duration: 500,
        // No need to check for the existence of these functions.
        beforeLoad: function () {},
        afterLoad: function () {},
        onUpdate: function () {},
        navigateToInsertedPhoto: false,
        context: this,
        loaderType: "light"
      }

      this.options = $.extend({}, defaults, params)

      this.srcPropertyName = params.srcPropertyName
      this.nWaitForPhotosThreads = 0
      this._photos = params.photos

      this.dataPage = new PhotoPages(params.photos, params.photosPerPage, this.srcPropertyName)
      this._templateContextPhotosPerPageArray = new Array(params.photosPerPage)
    },
    buildRendering: function () {
      this.inherited(this.buildRendering, arguments)
      this.$photos = this.$container.find(".mp-carousel-photo")
      this.$loader = this.$container.find(".mp-carousel-photo-loader")
    },
    _bindListener: function () {
      $(window).resize(function () {
        this.$photos.each(function () {
          // TODO Is this needed?
          tools.centerElement($(this), "vertical")
        })
      }.bind(this))
    },
    update: function (photos) {
      this.dataPage = new PhotoPages(photos, this.dataPage.photosPerPage)
      if (this.isStarted) {
        this._load()
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
      this._load()
    },
    insertPhoto: function (photo) {
      console.log("PhotoCarouselWidget: Inserting new photo %s to Carousel.", photo)

      if (this._started) {
        if (this.options.navigateToInsertedPhoto) {
          this.dataPage.navigateTo("last")
        }
        this.options.onUpdate.call(this.options.context, $(), $())
        this._load()
      }
    },
    deletePhoto: function (photo) {
      assertTrue(photo instanceof Photo, "input parameter photo has to be model of the type Photo")

      var onFadeOut = function () {
        // Update everything from and including the deleted photo element.
        this._load()
      }.bind(this)

      this.dataPage.deletePhoto(photo)

      // Did we delete on the current page?

      if (this._started) {
        var $currentItem = this.$photos.find("[data-keiken-id='" + photo.id + "']")

        if ($currentItem.length > 0) {
          this._numberOfDeleteAnimationsPlaying++
          $currentItem.fadeOut(500, function () {
            this._numberOfDeleteAnimationsPlaying--
            $(this)
              .removeAttr("src")
              .removeAttr(this.ID_DATA_ATTRIBUTE)
            if (this._numberOfDeleteAnimationsPlaying === 0) {
              onFadeOut.apply(this)
            }
          }.bind(this))
        }
        this.options.onUpdate.call(this.options.context, $(), $())
      }
    },
    /*
     * @public
     * @description Navigates only if necessary.
     * @param {Number | Photo} to
     */
    navigateTo: function (to) {
      var currentPageIndex = this.dataPage.getCurrentPageIndex()
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
      // TODO Do I need this guard?!
      // The photo is not on the current page or there is no current page yet (just started)
      if (to !== currentPageIndex) {
        this.dataPage.navigateTo(to)
        this._load()
      }
    },

    navigateLeft: function () {
      this.dataPage.navigateTo("previous")
      this._load()
    },
    navigateRight: function () {
      this.dataPage.navigateTo("next")
      this._load(this.dataPage.getCurrentPageWithoutPadding())
    },
    getNPages: function () {
      return this.dataPage.getNPages()
    },
    getCurrentPageIndex: function () {
      return this.dataPage.getCurrentPageIndex()
    },
    _getIndexForPhoto: function (photo) {
      return this._photos.indexOf(photo)
    },
    /**
      * @private
      * @description Loads current page
      * When everything is loaded, this.options.onLoad (optional) is executed and the carousel is updated to show the current page.
      * @param {int} from: Index of the first photo element to update. Default is 0.
      * @param {int} to: Index of the last photo element to update. Defaults to the length of the current Page
      * This can be used when items get deleted in the middle of the page. The last elements would be ignored without the to parameter.
      */
    _load: function () {
      var photos = this.dataPage.getCurrentPageWithoutPadding()

      if (photos.length === 0 && this.nWaitForPhotosThreads === 0) {
        this.options.beforeLoad.call(this.options.context, this.$photos)
        this.options.afterLoad.call(this.options.context, this.$photos)
        this._update()
      } else {
        console.log("PhotoCarouselWidget: Preparing to update")

        // Counts the photo already loaded.
        var loaded = 0
        /*
        * This thread will be executed every time a photo is loaded or an network error occured.
        * Once all photos are loaded, it will trigger the _update function.
        * If more than one thread is running at the same time, the last thread will update all photo elements.
        * This thread could be executed after the carousel has been garbage collected.
        * Protect everything with a try-catch clause.
        */
        var photoLoaded = function () {
          try {
            ++loaded

            // The photo
            if (loaded >= photos.length) {
              this.nWaitForPhotosThreads--
              // This threat is the last active threat -> If there were multiple threats during the creation time, then it must update the whole page.
              if (this.nWaitForPhotosThreads === 0) {
                console.log("PhotoCarousel: Last update threat. Calling _update.")
                // Trigger the afterLoad event.
                this.options.afterLoad.call(this.options.context, this.$photos)
                console.log("PhotoCarouselWidget: Starting to update")
                this._update()
              } else {
                console.log("PhotoCarouselWidget: Not the last update threat. Waiting for other update threats.")
              }
            }
          } catch (e) {
            console.log("PhotoCarouselWidget: Could not count loaded photos. Maybe the carousel was reset?")
            console.dir(e)
          }
        }.bind(this)

        // There might or might no be another thread that is waiting for photo.load events.
        // Incrementing this counter will force the thread to wait with _update.
        // In theory there could be an unlimited number of paralell threads loading photos, if the connection is slow.
        this.nWaitForPhotosThreads++

        /*
        * This thread will load the photos into anonymous image elements.
        * It will call the photoLoaded every time a photo is loaded or an error occurs.
        * This thread could be executed after the carousel has been garbage collected.
        * This must(!) not be interrupted, because if photos are inserted in quick succession new photo src will not be loaded properly. The loader for these photos will never be executed.
        * TODO interrupt loadPhotos and add the photos to the new photo loader. @see test/MultiplePagesPhotoWidget.insertPhoto.
        * Protect everything with a try-catch clause.
        */
        var loadPhotos = function () {
          try {
            // The browser might or might not trigger a load event on photos that have the src null.
            // Length could change in the meantime, do not store this in an intermediate variable.
            photos.forEach(function (photo) {
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

        // Starts the fadeout animation and the load thread afterwards. This will start the load thread, even if the animation is interrupted.
        new CarouselAnimation().start({
          items: this.$photos,
          loader: this.$loader,
          animation: this.options.effect,
          animationTime: this.options.duration,
          complete: loadPhotos
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

      // This threat could be executed after the carousel has been garbage collected.
      // Protect everything with a try-catch clause.
      var finishHandler = function () {
        try {
          // It is important that this loop iterates all $photos. Even those which could not be loaded.
          this.$photos.each(function (photoIndex, photoNode) {
            // This makes it possible to identify the photo by only looking at the img tag. The src of a photo must not be unique.
            var photo = photos[photoIndex]
            // Not every page is full
            if (photo) {
              $(photoNode).attr(this.ID_DATA_ATTRIBUTE, photo.getId())
            } else {
              $(photoNode).removeAttr(this.ID_DATA_ATTRIBUTE)
            }
          })
          this.options.onUpdate.call(this.options.context, this.$photos)
        } catch (e) {
          console.log("Could not finish the animation. Maybe the carousel has been reset")
        }
      }
      // Only show those $photos which srcs could be successfully loaded.
      new CarouselAnimation().end({
        items: this.$photos,
        photos: photos,
        srcPropertyName: this.srcPropertyName,
        loader: this.$loader,
        animation: this.options.effect,
        animationTime: this.options.duration,
        complete: finishHandler,
        context: this.options.context
      })
    }
  })
})
