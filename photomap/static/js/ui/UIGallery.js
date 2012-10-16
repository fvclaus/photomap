/*
 * @author Marc Roemer
 * @class UIGallery shows a album-like thumbnail representation of all photos of a single place in the album
 */
UIGallery = function (album) {

   this.album = album;

   this.$container = $('#mp-album');
   this.$gallery = $('#mp-album-wrapper');
   this.galleryPadding = this.$gallery.css("padding-left");
   this.galleryWidth = this.$gallery.width();

   this.visible = false;
   this.$elements = null;

};

UIGallery.prototype =  {

   initAfterAjax : function(){
      if ( main.getClientState().isAdmin() ){
         this.$container.bind('dragover', fileUpload.handleGalleryDragover);
         this.$container.bind('drop', fileUpload.handleGalleryDrop);
      }
   },
   /*
    * @author Frederik Claus
    * @description Reselect all images in the gallery. This is necessary when the gallery gets updated
    * @private
    */
   _searchImages : function(){
      this.$elements = this.$gallery.find('div.mp-gallery > img').not(".mp-option-add").not(".mp-controls-options");
   },
   /*
    * @returns {jQElement} Gallery element
    */
   getEl : function(){
      return this.$gallery;
   },
   getDimensions : function(){
      var position =  this.$gallery.position();
      position.width = this.$gallery.width();
      position.height = this.$gallery.height();
      console.log("width = " + position.width + " height = " + position.height);
      return position;
   },
   getScrollPane : function(){
      return this.$gallery.data('jsp');
   },
   setScrollPane : function(){
      this.$gallery.jScrollPane({
            verticalDragMinHeight: 40,
            verticalDragMaxHeight: 40,
            animateScroll: true
      });
   },
   /*
    * @private
    */
   _setVisibility : function(visible){
      this.visible = visible;
   },
   isVisible : function(){
      return this.visible;
   },
  /*
   * @description Loads all the photos in the gallery and displays them as thumbnails. This will block the UI.
   */
   show : function( photos ) {

      var state = main.getUIState();
      controls = main.getUI().getControls();
      var authorized = main.getClientState().isAdmin();
      
      state.setPhotos(photos);
      // show gallery in case it's hidden
      $("#mp-album").show();
      // visibility to true for exposé
      this._setVisibility(true);

      if (photos.length == 0){
         // bugfix for empty places (to show empty "add"-tile)
         if (state.isInteractive()){
            this.$gallery.append(
               $.jqote( '#galleryTmpl', {'isAdmin': authorized} )
            );
            controls.bindInsertPhotoListener();
         }
      }
      else{
         var instance = this;

         var controls = main.getUI().getControls();
         state.setAlbumLoading(true);
         var tmplPhotosData = new Array();
         var loaded = 0;
         main.getUI().disable;

         for( var i = 0, len = photos.length; i < len; ++i ) {
            tmplPhotosData.push( photos[i].source );
            $('<img/>').load(function() {
               ++loaded;
               if( loaded === len ) {
                  main.getUIState().setAlbumLoading(false);
                  main.getUI().enable();
                  // create wrapping anchors for images
                  instance.$gallery.append(
                     $.jqote( '#galleryTmpl', {
                           thumbAddress: tmplPhotosData,
                           isAdmin : authorized
                        })
                  );
                  //search all anchors
                  instance._searchImages();
                  // Drag n Drop for Photos in gallery if user is admin
                  if ( authorized ){
                     instance._bindSortableListener();
                  }
                  // create scrollpane
                  instance._bindScrollPaneListener();

                  instance._bindListener();

                  controls.bindInsertPhotoListener();
               }
            }).attr( 'src', photos[i].source );
         }
      }
   },
   _resizeThumbs : function(){
      this._searchImages();
      desiredHeight = $(".mp-gallery").width() * .25 + 'px';
      console.log(desiredHeight);
      this.$elements.each(function(index,element){
         $(this).height(desiredHeight);
      });
   },
   /*
    * @private
    */
   _bindScrollPaneListener : function(){
      this.$gallery
         .css("padding-left",this.galleryPadding)
         .width(this.galleryWidth)
         .jScrollPane({
            verticalDragMinHeight	: 40,
            verticalDragMaxHeight	: 40,
            animateScroll		: true
         });
      //hack to remove horizontal scrollbars which always show up
      $(".jspHorizontalBar").remove();
   },
   /*
    * @private
    */
   _bindSortableListener : function(){
      var instance = this;
      this.$gallery
         .find("div.mp-gallery")
         .sortable({
            items : "img.sortable",
            update : function(event,ui){
               instance._searchImages();
               var jsonPhotos = new Array();

               state.getPhotos().forEach(function(photo,index,photos){
                  // get html tag for current photo
                  currentPhoto = $('img[src="' + photo.source + '"]');
                  // find index of current photo in mp-gallery
                  photo.order = instance.$elements.index(currentPhoto);
                  // make a deep copy
                  jsonPhoto = $.extend(true,{},photo);
                  jsonPhotos.push(jsonPhoto);
                  // when all photos with new order are in jsonPhotos, save the order
                  if (index == photos.length-1){
                     main.getClientServer().savePhotoOrder(jsonPhotos);
                  }
               });
            }
         });
   },
   /*
    * @private
    */
   _bindListener : function(){

      var instance = this;
      var state = main.getUIState();
      var cursor = main.getUI().getCursor();
      var controls = main.getUI().getControls();

      //bind events on anchors
      instance.$elements
         .unbind('.Gallery')
         .bind( 'mouseenter.Gallery', function( event ) {
            var $el = $(this);
            $el
               .addClass('current')
               .removeClass("visited")
               .siblings('img').removeClass('current');
            photo = (state.getPhotos())[$el.index()];
            state.setCurrentPhotoIndex($el.index());
            state.setCurrentPhoto(photo);

            if ( state.isInteractive() ){
               controls.setModifyPhoto(true);
               controls.showPhotoControls($el,photo);
            }
            cursor.setCursor($el,cursor.styles.pointer);
         })
         .bind( 'mouseleave.Gallery', function( event ) {
            var $el = $(this);
            //add visited border if necessary
            (state.getPhotos())[$el.index()].checkBorder();
            $el.removeClass('current');

            if (state.isInteractive() ){
               controls.hideEditControls(true);
            }})
         .bind( 'mousedown.Gallery', function(event){
            var $el = $(this);
            // set Cursor for DragnDrop on images (grabber)
            cursor.setCursor($el,cursor.styles.grab);
         })
         .bind( 'click.Gallery', function( event ) {
            var $el = $(this);

            $el.removeClass('current');
            state.setCurrentPhotoIndex($el.index());
            state.setCurrentPhoto((state.getPhotos())[$el.index()]);

            main.getUI().getControls().hideEditControls(false);

            // starts little slideshow in gallery div
            instance.album.startSlider();

            return false;
         });

      //draw border on visited elements
      main.getUIState().getPhotos().forEach(function(photo){
         photo.checkBorder();
      });
   },

};
