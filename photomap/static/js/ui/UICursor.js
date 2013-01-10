/*global $, main, ALBUM_VIEW */
"use strict";

var UICursor, gmap, cursor, $information, $link, $question, $topic, $toggleGallery, $logo;

UICursor = function () {

   this.styles = {
      'default': 'default',
      pointer: 'pointer',
      cross: 'crosshair',
      grab: 'move',
      wait: 'wait',
      text: 'text',
      info: 'help',
      stop: 'not-allowed',
      progress: 'progress'
   };
};

UICursor.prototype = {

   initWithoutAjax : function () {
      this.cursors();
   },
   initAfterAjax : function () {
      this.setMapCursor();
   },

   setCursor : function ($element, style) {
      $element.css('cursor', style);
   },

   setMapCursor : function (style) {
      gmap = main.getMap().getInstance();
      if (style) {
         cursor = style;
      } else if (main.getUIState().isInteractive()) {
         // if no style is defined -> cross on interactive pages, else grabber
         cursor = this.styles.cross;
      } else {
         cursor = this.styles.grab;
      }
      gmap.setOptions({
         draggableCursor: cursor,
         draggingCursor: this.styles.grab,
      });
   },
   setInfoCursor : function (style) {
      $information = $(".mp-option-information");
      this.setCursor($information, style);
   },
   setZoomCursor : function ($element) {
      $element.addClass("mp-zoom");
   },
   cursors : function () {

      // on links
      $link = $("a");
      this.setCursor($link, this.styles.pointer);

      // on faq and tutorial entries
      $question = $(".mp-faq-question");
      this.setCursor($question, this.styles.pointer);
      $topic = $(".mp-tutorial-subtopic");
      this.setCursor($topic, this.styles.pointer);

      // on toggle gallery button
      $toggleGallery = $(".mp-option-toggle-gallery");
      this.setCursor($toggleGallery, this.styles.pointer);
      
      // on logo
      $logo = $(".mp-logo").find("svg");
      this.setCursor($logo, this.styles.pointer);
   },

};
