/*
 * @author Marc Roemer
 * @class UIAlbum is a facade for UIGallery, UISlideshow, UIFullscreen and UIState
 * @requires UIAlbum, UIGallery, UIFullscreen, UIState
 */
//TODO this class is not really a facade anymore. I.e. it does not propagate function calls,
//they are made directly to the responding class
UIAlbum = function() {

   this.gallery = new UIGallery(this);
   this.slideshow = new UISlideshow(this);
   this.fullscreen = new UIFullscreen(this);
   //TODO why is state in UIAlbum?
   this.state = new UIState(this);
   this.$loading = $("#mp-image-loading-small");

};

UIAlbum.prototype = {

   initWithoutAjax : function(){
      this.slideshow.initWithoutAjax();
   },
   initAfterAjax : function(){
      this.gallery.initAfterAjax();
   },
   getSlideshow : function(){
      return this.slideshow;
   },

   getFullscreen : function(){
      return this.fullscreen;
   },
   /**
    * @public
    * This is only used by the UI class
    */
   getGallery : function(){
      return this.gallery;
   },
   
   getState : function(){
      return this.state;
   },
   //TODO this is not used but is recommended instead of main.getSlideshow().navigateSlider(...)
   navigateSlider : function(instance,dir){
      return this.slideshow._navigateSlider(instance,dir);
   },
   startSlider : function(){
      return this.slideshow._startSlider();
   },
   //TODO not used anymore. needed?
//   /*
//    * @private
//    */
//   _hideLoading : function(){
//      this.$loading.hide();
//   },
//   /*
//    * @private
//    */
//   _showLoading : function(){
//      this.$loading.show();
//   },
//
//   disableGallery : function(){
//      this.slideshow.disableControls();
//      this._showLoading();
//      this.loading = true;
//   },
//
//   enableGallery : function(){
//      this.slideshow.enableControls();
//      this._hideLoading();
//      this.loading = false;
//   }
};

