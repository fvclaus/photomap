/*jslint */
/*global $, gettext */

"use strict";

/**
 * @author Marc-Leon Römer
 * @class provides methods to show basic tooltips over given elements
 */

define(["dojo/_base/declare"], 
      function (declare) {
         return declare (null, {
            constructor : function ($container, message, options) {
               this.defaults = {
                  hideOnMouseover: true,
                  hideOnClick: false,
                  openAgainOnMouseleave: false
               };
               this.options = $.extend({}, this.defaults, options);
               this.$container = $container;
               this.$tooltip = null;
               this.message = message;
               this.closed = true;
               this.fadingTime = 200;
               this.started = false;
               this.id = $(".mp-tooltip").size();
            },
            start : function () {
               var $tooltip = $("<div style='display: none' class='mp-tooltip' id='mp-tooltip-" + this.id + "'></div>"),
                  $close;
               
               if (!this.started) {
                  this.$container.append($tooltip);
                  this.$tooltip = $tooltip;
                  this.$tooltip.html(this.message);
                  this._resize();
                  this._position();
                  
                  this._bindListener();
                  this._bindResizeListener();
                  
                  this.started = true;
               }
               return this;
            },
            /**
             * @desription closes the tooltip. Tooltip can just be opened again by calling this.open - it does not get visible automatically
             */
            close : function (closed) {
               if (this.started && (this.$tooltip.is(":visible") || !this.closed)) {
                  this.$tooltip.fadeOut(this.fadingTime);
                  if  (closed !== undefined) {
                     this.closed = closed;
                  } else {
                     this.closed = true;
                  }
               }
            },
            open : function () {
               if (this.started && (!this.$tooltip.is(":visible") || this.closed)) {
                  this.$tooltip.fadeIn(this.fadingTime);
                  this.closed = false;
               } else if (!this.started) {
                  this.start();
               }
            },
            setMessage : function (message) {
               assertString(message, "the message has to be a string");
               
               this.message = message;
               if (this.started) {
                  this.$tooltip.html(message);
               }
               return this;
            },
            /**
             * @param {String/Object} options Can be string describing one option or object - possible options are all in this.defaults
             */
            setOption : function (options, value) {
               var instance = this, option;
               
               if (typeof options === "string") {
                  option = options;
                  options = {};
                  options[option] = value;
               }
               $.each(options, function (optionName, optionValue) {
                  assertTrue(instance.defaults[optionName], "All possible options are in this.defaults - all other options have no effect");
                  
                  instance.options[optionName] = optionValue;
               });
               
               return this;
            },
            /**
             * @description removes the tooltip from the page.
             */
            destroy : function () {
               var instance = this;
               if (this.started) {
                  this.$tooltip.fadeOut(this.fadingTime, function () {
                     instance._unbindListener();
                     instance.$tooltip.remove();
                     instance.$tooltip = null;
                     instance.started = false;
                  });
               }
            },
            _resize : function () {
               this.$tooltip.css({
                  width : this.$container.outerWidth(),
                  height: this.$container.outerHeight()
               });
            },
            _position : function () {
               var zIndex = parseInt(this.$container.css("z-index")),
                  top = 0,
                  left = 0;
               if (!zIndex) {
                  zIndex = 0;
               }
               if (this.$container.css("position") !== "relative") {
                  top = this.$container.position().top;
                  left = this.$container.position().left;
               }
               this.$tooltip.css({
                  "top" : top,
                  "left": left,
                  "z-index": zIndex + 1
               });
            },
            _bindResizeListener : function () {
               var instance = this;
               $(window).on("resize.Tooltip-" + this.id, function () {
                  if (instance.started) {
                     instance._resize();
                     instance._position();
                  }
               });
            },
            _unbindListener : function () {
               this.$tooltip.off(".Tooltip");
               this.$container.off(".Tooltip");
               $(window).off("resize.Tooltip-" + this.id);
            },
            _bindListener : function () {
               var instance = this;
               // use fadeOut instead of this.close here, so that tooltip gets visible again after mouse leaves the $container
               this.$tooltip
                  .on("mouseenter.Tooltip", function (event) {
                     if (instance.options.hideOnMouseover && instance.started && !instance.closed) {
                        instance.$tooltip.stop(true, true);
                        instance.$tooltip.fadeOut(instance.fadingTime);
                     }
                  })
                  .on("click.Tooltip", function (event) {
                     if (instance.options.hideOnClick && instance.started && !instance.closed) {
                        instance.close(!instance.options.openAgainOnMouseleave);
                     }
                  });
               this.$container.on("mouseleave.Tooltip", function (event) {
                  if ((instance.options.hideOnMouseover || instance.options.openAgainOnMouseleave) && instance.started && !instance.closed) {
                     instance.$tooltip.stop(true, true);
                     instance.$tooltip.fadeIn(instance.fadingTime);
                  }
               });
            }
         });
      });
