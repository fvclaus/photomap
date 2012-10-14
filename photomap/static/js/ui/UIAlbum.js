/*
 * @author Marc Roemer
 * @class UIAlbum is a facade for UIGallery, UISlideshow, UIFullscreen and UIState
 * @requires UIAlbum, UIGallery, UIFullscreen, UIState
 */
UIAlbum = function() {

   this.gallery = new UIGallery(this);
   this.slideshow = new UISlideshow(this);
   this.fullscreen = new UIFullscreen(this);
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

   getGallery : function(){
      return this.gallery;
   },

   getState : function(){
      return this.state;
   },

   navigateSlider : function(instance,dir){
      return this.slideshow._navigateSlider(instance,dir);
   },
   startSlider : function(){
      return this.slideshow._startSlider();
   },

   zoom : function(){
      return this.fullscreen.zoom();
   },
   /*
    * @private
    */
   _hideLoading : function(){
      this.$loading.hide();
   },
   /*
    * @private
    */
   _showLoading : function(){
      this.$loading.show();
   },


   hide : function() {
      this.slideshow.closeSlideshow();
      this.gallery.getEl().empty();
      this.gallery.getEl().removeData('jsp');
   },

   disableGallery : function(){
      this.slideshow.disableControls();
      this._showLoading();
      this.loading = true;
   },

   enableGallery : function(){
      this.slideshow.enableControls();
      this._hideLoading();
      this.loading = false;
   },

   _updateText : function(){
      if (this.currentPhoto){
         information = main.getUI().getInformation();
         information.showImageNumber();
         currentIndex = this.photos.indexOf(this.currentPhoto) + 1;
         information.setImageNumber(currentIndex+"/"+this.photos.length);
      }
   },
};

