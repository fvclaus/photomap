/*jslint */
/*global $, main */

"use strict";

var UIPanel;

UIPanel = function () {

   this.$topPanel = $('.mp-top-panel');
   this.$bottomPanel = $('.mp-bottom-panel');
   this.$footer = $("#mp-page-footer");
   this.$header = $("#mp-page-header");
   this.$title = this.$header.find(".mp-page-title h1");
   this.$logout = this.$footer.find(".mp-option-logout") || null;
   this.$nav = this.$footer.find(".mp-internal-links");
   this.$logo = this.$header.find(".mp-keiken-logo");
};

UIPanel.prototype = {
   
   initWithoutAjax : function () {
      this.resizeLogo();
      this.bindLogoListener();
      this.resizeFooterFont();
   },
   getFooterHeight : function () {
      return this.$footer.height();
   },
   getHeaderOffset: function () {
      return this.$header.offset();
   },
   resizeLogo : function () {
      
      var headerHeight, logoOriginalHeight, logoOriginalWidth, scaleRatio, logoScaledHeight, logoScaledWidth;
      
      headerHeight = this.$header.height();
      logoOriginalHeight = this.$logo.attr("height");
      logoOriginalWidth = this.$logo.attr("width");
      
      scaleRatio = headerHeight / logoOriginalHeight;
      //logoScaledHeight = logoOriginalHeight * scaleRatio;
      //logoScaledWidth = logoOriginalWidth * scaleRatio;
      
      this.$logo.find("g").attr("transform", "scale(" + scaleRatio + ")");
      //this.$logo.attr("height", logoScaledHeight);
      //this.$logo.attr("width", logoScaledWidth);
   },
   bindLogoListener : function () {
      this.$logo.bind("click", function () {
         
         if ($(".mp-user").size() > 0) {
            window.location.href = "/dashboard";
         } else {
            window.location.href = "/";
         }
      });
   },
   resizeFooterFont : function () {
      
      var text, width, height, tools, size;
      
      text = this.$footer.find(".mp-internal-links a").first().text();
      width = $(".mp-internal-links").width();
      height = this.$footer.height();
      tools = main.getUI().getTools();
      size = tools.calculateFontSize(text, width, height);
      this.$footer.css("fontSize", size + "px");
      this.$logout.css({
         height: height + "px",
         width: height + "px"
      });
   },
   getHeight : function () {
      
      var tools;
      
      tools = main.getUI().getTools();
      return tools.getRealHeight(this.$header);
   }

};
