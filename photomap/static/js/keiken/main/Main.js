/*jslint */
/*global define, $ */

"use strict";


/**
 * @author Frederik Claus
 * @class Initializes main classes.
 */

define([
   "dojo/_base/declare",
   "../view/MapView",
   "../widget/ModelOperationWidget",
   "../view/DetailView",
   "../widget/SlideshowWidget",
   "../widget/AdminGalleryWidget",
   "../widget/FullscreenWidget",
   "../widget/GalleryWidget",
   "../view/DialogView",
   "../widget/PageTitleWidget",
   "./UIState",
   "dojo/domReady!"
],
   function (declare, MapView, ModelOperationWidget, DetailView,  SlideshowWidget, AdminGalleryWidget, FullscreenWidget, GalleryWidget, DialogView, PageTitleWidget, state) {

      var Main = declare(null, {
         
         constructor : function () {
            var instance = this;
            this.map = new MapView();
            this.controls = new ModelOperationWidget(null, $("#mp-controls").get(0));
            this.controls.startup({ shareOperation : state.isDashboardView()});
            this.input = new DialogView();
            this.information = new DetailView();
            if (state.isAlbumView()) {
               this.gallery = new GalleryWidget(null, $("#mp-gallery").get(0));
               this.slideshow = new SlideshowWidget(null, $(".mp-slideshow").get(0));
               this.slideshow.startup();
               this.adminGallery = new AdminGalleryWidget(null, $("#mp-full-left-column").get(0));
               this.adminGallery.startup();
               this.fullscreen = new FullscreenWidget(null, $("#mp-fullscreen").get(0));
               this.fullscreen.startup();
               this.pageTitle = new PageTitleWidget();
            }
         },
         getMap : function () {
            return this.map.getPresenter();
         },
         getGallery : function () {
            if (state.isDashboardView()) {
               return null;
            }
            return this.gallery;
         },
         getAdminGallery : function () {
            if (state.isDashboardView()) {
               return null;
            }
            return this.adminGallery;
         },
         getSlideshow : function () {
            if (state.isDashboardView()) {
               return null;
            }
            return this.slideshow;
         },
         getFullscreen : function () {
            if (state.isDashboardView()) {
               return null;
            }
            return this.fullscreen;
         },
         getControls : function () {
            return this.controls;
         },
         getInput : function () {
            return this.input;
         },
         getDialog : function () {
            return this.input;
         },
         getInformation: function () {
            return this.information.getPresenter();
         },
         getPageTitleWidget : function () {
            return this.pageTitle;
         }
      }),
          _instance = new Main();
      return _instance;
   });