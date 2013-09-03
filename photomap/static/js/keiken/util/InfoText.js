/*jslint */
/*global $, gettext, window, document, define, assertTrue, assertString */

"use strict";

/**
 * @author Marc-Leon Römer
 * @class provides methods to show basic tooltips over given elements
 */

//TODO Add listener for Esc and Return to enable closing of InfoText by pressing these keys, also implement Fullscreen overlay message (like alerts)

define(["dojo/_base/declare"],
   function (declare) {
      return declare(null, {
         constructor : function ($container, message, options) {
            this.defaults = {
               hideOnMouseover: true,
               hideOnClick: false,
               hideOnEscape: false,
               openOnMouseleave: false
            };
            this.options = $.extend({}, this.defaults, options);
            this.$container = $container;
            this.$infoText = null;
            this.$infoAlert = null;
            this.$mask = null;
            this.message = message;
            this.closed = true;
            this.fadingTime = 200;
            this.started = false;
            this.alertAttributes = {
               prepared: false,
               closed: true,
               $mask: null,
               $textContainer: null,
               isRead: false
            };
            this.id = $(".mp-infotext").size();
         },
         /**
          * @description start/initialize the InfoText - the $infoText won't be visible yet!
          * @return returns this instance of the InfoText in case you want to call another method after starting it - eg. .open()
          */
         start : function () {
            var $infoText = $("<div style='display: none' class='mp-infotext' id='mp-infotext-" + this.id + "'><div><span></span></div></div>");
            
            if (!this.started) {
               this.$container.append($infoText);
               this.$infoText = $infoText;
               this.$infoText.find("span").html(this.message);
               this._bindListener();
               this._position();
               this._resize();
               this._bindResizeListener();
               this.started = true;
            }
            
            return this;
         },
         /**
          * @desription closes the InfoText. InfoText can just be opened again by calling this.open - it does not get visible automatically
          */
         close : function (closed) {
            if (this.started && (this.$infoText.is(":visible") || !this.closed)) {
               this.$infoText.fadeOut(this.fadingTime);
               if (this.$mask) {
                  this.$mask.fadeOut(this.fadingTime);
               }
               if (closed !== undefined) {
                  this.closed = closed;
               } else {
                  this.closed = true;
               }
            }
         },
         /**
          * @description shows the InfoText and starts it prior that if necessary
          */
         open : function () {
            if (this.started && (!this.$infoText.is(":visible") || this.closed)) {
               this.$infoText.fadeIn(this.fadingTime);
               this.closed = false;
               if (this.$mask) {
                  this.$mask.fadeIn(this.fadingTime);
               }
            } else if (!this.started) {
               this.start().open();
            }
         },
         // @description imitates an alert displaying the given message - doesn't require InfoText to be started or $container & options to be set
         alert : function (message) {
            var instance = this;
            
            if (!this.alertPrepared) {
               this._prepareAlert();
            }
            
            // we can trust the message -> html is ok
            this.alertAttributes.$textContainer.find("span").html(message);
            
            this.alertAttributes.$textContainer.fadeIn(this.fadingTime, function () {
               instance.alertAttributes.closed = false;
            });
            this.alertAttributes.$mask.fadeIn(this.fadingTime);
            
            // prevent accidental closing of alert -> show for at least 2s
            this.alertAttributes.isRead = false;
            window.setTimeout(function (instance) {
               instance.alertAttributes.isRead = true;
            }, 2000, this);
         },
         /**
          * @description set a new Message for this InfoText - will update the html if started
          * @return returns this instance of the InfoText - in case you want to call other methods after setting the message
          */
         setMessage : function (message) {
            assertString(message, "the message has to be a string");
            
            this.message = message;
            if (this.started) {
               this.$infoText.find("span").html(message);
            }
            return this;
         },
         /**
          * @param {String/Object} options Can be string describing one option or object with multiple options - possible options are all in this.defaults
          * @return returns this instance of the InfoText - in case you want to call other methods after setting the option(s)
          */
         setOption : function (options, value) {
            var instance = this, option;
            
            if (typeof options === "string") {
               option = options;
               options = {};
               options[option] = value;
            }
            $.each(options, function (optionName, optionValue) {
               assertTrue(instance.defaults.hasOwnProperty(optionName), "All possible options are in this.defaults - all other options have no effect");
               
               instance.options[optionName] = optionValue;
            });
            
            return this;
         },
         /**
          * @description sets a new container for the InfoText - requires InfoText to be destroyed first (or not started yet)
          */
         setContainer : function ($container) {
            assertTrue(!this.started, "InfoText has to be destroyed before changing the container!");
            
            this.$container = $container;
            
            return this;
         },
         /**
          * @description removes the InfoText from the page.
          */
         destroy : function () {
            
            if (this.started) {
               
               this.$infoText.hide();
               this._unbindListener();
               this.$infoText.remove();
               this.$infoText = null;
               this.started = false;
            }
            
            return this;
         },
         _prepareAlert : function () {
            if ($("#mp-mask").length > 0) {
               this.alertAttributes.$mask = $("#mp-mask");
            } else {
               this.alertAttributes.$mask = $("<div id='mp-mask'></div>").appendTo("body");
            }
            if ($("#mp-infoalert").length > 0) {
               this.alertAttributes.$textContainer = $("#mp-infoalert");
            } else {
               this.alertAttributes.$textContainer = $("<div id='mp-infoalert'><div><span></span></div></div>").appendTo("body");
            }
            this.alertAttributes.$textContainer.append("<div id='mp-infotext-closing-help'>" + gettext("CLOSE_INFOTEXT_ALERT") + "</div>");
            this._bindAlertListener();
            this.alertAttributes.prepared = true;
         },
         _closeAlert : function (instance) {
            if (this.alertAttributes.prepared && (this.alertAttributes.$textContainer.is(":visible") || !this.alertAttributes.closed)) {
               // prevent accidental closing of alerts -> user is supposed to read the alert cause it gives important information
               if (!this.alertAttributes.isRead) {
                  return false;
               }
               this.alertAttributes.$textContainer.fadeOut(this.fadingTime);
               this.alertAttributes.$mask.fadeOut(this.fadingTime);
               this.alertAttributes.closed = true;
               return true;
            }
            return false;
         },
         _position : function () {
            var zIndex = parseInt(this.$container.css("z-index"), 10),
               top = 0,
               left = 0;
            
            if (!zIndex) {
               zIndex = 0;
            }
            if (this.$container.css("position") !== "relative") {
               top = this.$container.position().top;
               left = this.$container.position().left;
            }
            this.$infoText.css({
               "top" : top,
               "left": left,
               "z-index": zIndex + 1
            });
         },
         _resize : function () {
            this.$infoText.css({
               "maxWidth" : this.$container.outerWidth(),
               "maxHeight": this.$container.outerHeight()
            });
         },
         _bindResizeListener : function () {
            var instance = this;
            $(window).on("resize", function () {
               instance._position();
               instance._resize();
            });
         },
         _bindAlertListener : function () {
            var instance = this,
               click = function () {
                  instance.alertAttributes.$textContainer.stop(true, true);
                  instance.alertAttributes.$mask.stop(true, true);
                  instance._closeAlert();
               };
            this.alertAttributes.$mask.on("click", click);
            this.alertAttributes.$textContainer.on("click", click);
         },
         _unbindListener : function () {
            this.$infoText.off(".InfoText");
            this.$container.off(".InfoText");
            $(window).off("resize.InfoText-" + this.id);
         },
         _bindListener : function () {
            var instance = this;
            // use fadeOut instead of this.close here, so that InfoText gets visible again after mouse leaves the $container
            this.$infoText
               .on("mouseenter.InfoText", function (event) {
                  if (instance.options.hideOnMouseover && instance.started && !instance.closed) {
                     instance.$infoText.stop(true, true);
                     instance.$infoText.fadeOut(instance.fadingTime);
                  }
               })
               .on("click.InfoText", function (event) {
                  if (instance.options.hideOnClick && instance.started && !instance.closed) {
                     instance.close(!instance.options.openOnMouseleave);
                  }
               });
            this.$container.on("mouseleave.InfoText", function (event) {
               if ((instance.options.hideOnMouseover || instance.options.openOnMouseleave) && instance.started && !instance.closed) {
                  instance.$infoText.stop(true, true);
                  instance.$infoText.fadeIn(instance.fadingTime);
               }
            });
            $(document).on("keyup.InfoText", null, "esc", function (event) {
               // if alert is open close it and leave everything else as it is
               if (!instance.alertAttributes.closed) {
                  instance._closeAlert();
                  return;
               }
               if (instance.options.hideOnEscape && instance.started && !instance.closed) {
                  instance.$infoText.stop(true, true);
                  instance.close(!instance.options.openOnMouseleave); // if openOnMouseleave is false -> fully close, else just hide
               }
            });
         }
      });
   });
