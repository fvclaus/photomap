"use strict"

/**
 * @author Marc-Leon Römer
 * @class provides basic effects for switching images in carousels
 */

define(["dojo/_base/declare"],
  function (declare) {
    return declare(null, {
      FADE: 0,
      FLIP: 1,
      constructor: function (params) {
        assertSchema({
          items: assertObject,
          loader: assertObject
        }, params)
        this.options = $.extend({}, {
          animationTime: 200,
          context: null
        }, params)
      },
      _addCssTransition: function ($items) {
        $items.css("transition", "all " + (this.options.animationTime / 1000) + "s linear")
      },
      _removeCssTransition: function ($items) {
        $items.css("transition", "")
      },
      fadeOut: function (completeFn) {
        this._start(function ($item) {
          this._opacity($item, 0)
        }, completeFn)
      },
      flipOut: function (completeFn) {
        this._start(function ($item) {
          this._scaleX($item, 0)
        }, completeFn)
      },
      _start: function (animationFn, completeFn) {
        var items = this.options.items
        var loader = this.options.loader

        items.show()
        this._addCssTransition(items)

        $.each(items, function (index, item) {
          animationFn.call(this, $(item))
        }.bind(this))

        setTimeout(function () {
          try {
            if (!this._destroyed) {
              items.hide()
              loader.show()
            }
            this._removeCssTransition(items)
            // Never skip the start complete event.
            // The complete event starts the load handler for photos.
            completeFn.call(this.options.context, items)
          } catch (e) {
            console.error("CarouselAnimation: This instance has been destroyed. Aborting.")
            console.error(e)
          }
        }.bind(this), this.options.animationTime + 200) // Fadeout animations take a little longer than the specified animationTime.
      },
      fadeIn: function (completeFn) {
        this._end(function ($item) {
          // Remove opacity property
          this._opacity($item, "")
        }, completeFn)
      },
      flipIn: function (completeFn) {
        this._end(function ($item) {
          this._scaleX($item, 1)
        }, completeFn)
      },
      _end: function (animationFn, completeFn) {
        var items = this.options.items
        var loader = this.options.loader
        loader.hide()

        items.show()
        this._addCssTransition(items)

        // Animation does not work if set in this tick.
        setTimeout(function () {
          $.each(items, function (index, item) {
            animationFn.call(this, $(item))
          }.bind(this))
        }.bind(this), 10)

        setTimeout(function () {
          try {
            this._removeCssTransition(items)
            completeFn.call(this.options.context, this.options.items)
          } catch (e) {
            console.log("CarouselAnimation: This instance has been destroyed. Aborting.")
            console.dir(e)
          }
        }.bind(this), this.options.animationTime)
      },
      _opacity: function ($element, value) {
        $element.css("opacity", value)
      },
      _scaleX: function ($element, value) {
        var transformValue = $element.css("transform")
        if (value === 0) {
          $element.attr("data-animation-transform", transformValue)
          var matrixValues = transformValue
            .slice(7, transformValue.length - 1)
            .split(",")
            .map(function (value) { return parseInt(value) })
          // Apply scaleX(0) to the current transformation matrix
          // While 0 mathematically works, it does not display an animation
          matrixValues[0] = 0.000001
          matrixValues[1] = 0
          transformValue = "matrix(" + matrixValues.join(",") + ")"
          $element.css("transform", transformValue)
        } else if (value === 1) {
          $element.css("transform", $element.attr("data-animation-transform"))
        }
      }
    })
  })
