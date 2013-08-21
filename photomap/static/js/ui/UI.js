/*jslint */
/*global $, define, main,   UIState,  UIInput, DASHBOARD_VIEW, ALBUM_VIEW, TEMP_TITLE_KEY, TEMP_DESCRIPTION_KEY */

"use strict";

/**
 * @author Frederik Claus, Marc Roemer
 * @class UI is a wrapper class for everything that is visible to the user
 * @requires UITools, UIControls, UIInput, UIState 
 *
 */

define(["dojo/_base/declare", 
        "model/Photo", 
        "model/Place", 
        "model/Album", 
        "widget/ModelOperationWidget",
        "view/DetailView",
        "view/StatusMessageView",
        "widget/SlideshowWidget",
        "widget/AdminGalleryWidget",
        "widget/FullscreenWidget",
        "widget/GalleryWidget",
        "view/DialogView",
        "widget/PageTitleWidget",
        "ui/UIState",
        "dojo/domReady!"
       ],
       function(declare, Photo, Place, Album, ModelOperationWidget, DetailView, StatusMessageView, SlideshowWidget, AdminGalleryWidget, FullscreenWidget, GalleryWidget, DialogView, PageTitleWidget, state) {
           var UI = declare(null, {
              constructor : function () {
                 this.controls = new ModelOperationWidget(null, $("#mp-controls").get(0));
                 this.controls.startup({ shareOperation : state.isDashboardView()});
                 this.input = new DialogView();
                 this.state = state;
                 this.information = new DetailView();
                 this.message = new StatusMessageView();

                 if (this.state.isAlbumView()) {
                    this.gallery = new GalleryWidget(null, $("#mp-gallery").get(0));
                    this.gallery.startup();
                    this.slideshow = new SlideshowWidget(null, $(".mp-slideshow").get(0));
                    this.slideshow.startup();
                    this.adminGallery = new AdminGalleryWidget(null, $("#mp-full-left-column").get(0));
                    this.adminGallery.startup();
                    this.fullscreen = new FullscreenWidget(null, $("#mp-fullscreen").get(0));
                    this.fullscreen.startup();
                    this.pageTitle = new PageTitleWidget();
                 } 
                 this._isDisabled = false;
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
              //TODO This shouldn't be used as UIState is a singleton and should be accessed in a static way (@ui-tests.js!)
              getState: function () {
                 return this.state;
                 //throw new Error("DoNotUseThisError");
              },
              getTools: function () {
                 throw new Error("DoNotUseThisError"); 
              },
              getInformation: function () {
                 return this.information.getPresenter();
              },
              getMessage : function () {
                 return this.message;
              },
              getPageTitleWidget : function () {
                 return this.pageTitle;
              }
           }),
           
           _instance = new UI();
           // singleton
           return _instance;
        });
