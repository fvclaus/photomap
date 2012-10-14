/*
 * @author Frederik Claus
 * @class UIControls adds Listener to all input elements that are present once the site is loaded
 */
UIControls = function(maxHeight) {

   this.$controls = $(".mp-controls-wrapper");
   this.$controls.hide();
   // icons of photo controls are not scaled yet
   this.$controls.isScaled = false;
   // tells the hide function whether or not the mouse entered the window
   this.$controls.isEntered = false;

   this.$delete = $("img.mp-option-delete");
   this.$update = $("img.mp-option-modify");
   this.$share = $("img.mp-option-share");

   this.$logout = $(".mp-option-logout");
   this.$center = $(".mp-option-center");

};

UIControls.prototype = {

   initWithoutAjax : function(){
      this._positionCenterControl();
      height = main.getUI().getPanel().getFooterHeight();
      this.$logout.height(height);
   },
   initAfterAjax : function(){
      state = main.getUIState();
      clientstate = main.getClientState();
      page = state.getPage();
      if ( page == DASHBOARD_VIEW || page == ALBUM_VIEW && clientstate.isAdmin() ){
         this.bindListener(page);
      }
   },
   /*
    * @private
    */
   _positionCenterControl : function(){
      //reposition
      this.$center.show();
      position = $("#mp-map").position();

      position.top += $("#mp-header").height() * 2.25;
      position.left += $("#mp-header").height() * 0.35;
      this.$center.css({
         'top' : position.top,
         'left' : position.left
         }).hide();
   },

   /*
    * @description Displays modify control under a photo
    * @param $el The photo element under which controls are placed
    * @public
   */
   showPhotoControls : function($el){
      center = $el.offset();
      tools = main.getUI().getTools();
      center.left += tools.getRealWidth($el)/2;
      center.top += tools.getRealHeight($el);

      // clear any present timeout, as it will hide the controls while the mousepointer never left
      if(this.hideControlsTimeoutId){
            window.clearTimeout(this.hideControlsTimeoutId);
            this.hideControlsTimeoutId = null;
      }
      this._showMarkerControls(center);
      this.setModifyPhoto(true);
   },

   /*
    * @description Controls are instantiated once and are used for albums, places and photos
    * @param {Object} center the bottom center of the element where the controls should be displayed
    * @private
   */
   _showMarkerControls : function(center){
      // calculate the offset
      tools = main.getUI().getTools();
      // center the controls below the center
      center.left  -= tools.getRealWidth(this.$controls)/2;

      // offset had a weird problem where it was pushing the controls down with every 2 consecutive offset calls
      this.$controls
         .css({
            top: center.top,
            left: center.left
         }).show();

      // change factor depending on the page (-> number of controls in control-box)
      if (main.getUIState().isDashboard()) {
            factor = 0.31;
      }
      else {
            factor = 0.45;
      }
      // don't resize the icons all the time to save performance
      if (!this.$controls.isScaled){
            this.$controls
         .find(".mp-controls-options")
         .height(this.$controls.height() * 0.8)
         .width(this.$controls.width() * factor);
      }
   },
   /*
    * @public
    */
   setModifyAlbum : function(active){
      this.isModifyAlbum = active;
      this.isModifyPlace = !active;
      this.isModifyPhoto = !active;
   },
   /*
    * @public
    */
   setModifyPlace : function(active){
      this.isModifyPlace = active;
      this.isModifyAlbum = !active;
      this.isModifyPhoto = !active;
   },
   /*
    * @public
    */
   setModifyPhoto : function(active){
      this.isModifyPhoto = active;
      this.isModifyPlace = !active;
      this.isModifyAlbum = !active;
   },
   /*
    * @description hides the modfiy controls
    * @param {Boolean} timeout if the controls should be hidden after a predefined timout, when the controls are not entered
    * @private
   */
   hideEditControls : function(timeout){
      var instance = this;
      hide = function(){
         if(instance.$controls.isEntered){
            return;
         }
         instance.$controls.hide();
      };

      if(timeout){
            this.hideControlsTimeoutId = window.setTimeout(hide,1000);
      }
      else{
            this.$controls.hide();
      }
   },
   /*
    * @public
    * @see UIAlbum
    */
   bindInsertPhotoListener : function(){
      this.$insert = $(".mp-option-add");
      //commit in iframe because of img upload
      this.$insert
            .remove("click.PhotoMap")
            .bind("click.PhotoMap",function(event){
            place = main.getUIState().getCurrentPlace();
            // reset load function
            main.getUI().getInput().getUpload("/insert-photo?place="+place.id,function(){return;});
      });
   },
   /*
    * @public
    * @see UITools
    */
   bindCopyListener : function(){
      // copy to clipboard with jquery (zclip) using ZeroClipboard (javascript and flash)
      $("#mp-copy-button").zclip('remove').zclip({
            path: 'static/js/zeroclipboard/zeroclipboard.swf',
            copy: $("#mp-share-link").val(),
            /*afterCopy: function(){
         $(".mp-overlay-trigger").overlay().close();
            },*/
      });
   },
   /*
    * @description Binds all the Listeners required by this page. Also handles window.load Listener
    * @param {String} page Name of current page
    */
   bindListener : function(page){
      //make variables globally available for all _bindXXX methods
      var instance = this;
      var state = main.getUIState();
      var information = main.getUI().getInformation();
      var tools = main.getUI().getTools();
      var input = main.getUI().getInput();
      var page = state.getPage();

      this._bindDeleteListener();
      this._bindUpdateListener();
      this._bindNavigationListener();

      if (page == DASHBOARD_VIEW){
         this._bindShareListener();
         this._bindAlbumListener();
      }
      else if (page == ALBUM_VIEW){
         instance._bindPlaceListener();
      }
      else{
         alert("Unknown page: " + page);
      }
   },
   /*
    * @private
    */
   _bindDeleteListener : function(){
      var instance = this;
      this.$delete
         .unbind("click")
         .bind("click",function(event){
            // hide current place's markers and clean photos from gallery
            photo = state.getCurrentPhoto();
            place = state.getCurrentPlace();
            album = state.getCurrentAlbum();
            var url,data;

            // delete current photo
            if (instance.isModifyPhoto) {
                  if(confirm("Do you really want to delete photo " + photo.title)){
               url = "/delete-photo",
               data = {"id":photo.id};
               state.removePhoto(photo);
               $("div.mp-gallery > img[src='"+photo.source+"']").remove();
               main.getUI().getAlbum().getScrollPane().reinitialise();
                  }
                  else
               return;
            }
            // delete current place
            else if(instance.isModifyPlace){
                  if(confirm("Do you really want to delete place " + place.title)){
               url = "/delete-place";
               data = {"id":place.id};
               state.removePlace(place);
               information.hidePlaceTitle();
               place._delete();
                  }
                  else
               return;
            }
            // delete current album
            else if(instance.isModifyAlbum){
                  if(confirm("Do you really want to delete Album " + album.title)){
               url = "/delete-album";
               data = {"id":album.id};
               album._delete();
                  }
                  else
               return;
            }
            else{
                  alert("I don't know what to delete. Did you set one of setModify{Album,Place,Photo}?");
                  return;
            }

            // call to delete marker or photo in backend
            tools.deleteObject(url,data);
      });
   },
   /*
    * @private
    */
   _bindUpdateListener : function(){
      var instance = this;
      var input = main.getUI().getInput();
      this.$update
         .unbind("click")
         .bind("click",function(event){
            var place = state.getCurrentPlace();
            var photo = state.getCurrentPhoto();
            var album = state.getCurrentAlbum();

            // edit current photo
            if (instance.isModifyPhoto) {

               input
                  .onLoad(function(){
                     //prefill with values from selected picture
                     $("input[name=id]").val(photo.id);
                     $("input[name=order]").val(photo.order);
                     var $title = $("input[name=title]").val(photo.title);
                     var $description = $("textarea[name=description]").val(photo.description);

                     input.onForm(function(){
                           //reflect changes locally
                           photo.title = $title.val();
                           photo.description = $description.val();
                     });
                  })
                  .get("/update-photo");
            }

            //edit current place
            else if (instance.isModifyPlace){
               //prefill with name and update on submit

               input
                  .onLoad(function(){
                     $("input[name=id]").val(place.id);
                     var $title = $("input[name=title]").val(place.title);
                     var $description = $("textarea[name=description]").val(place.description);

                     input.onForm(function(){
                           //reflect changes locally
                           place.title = $title.val();
                           place.description = $description.val();
                           main.getUI().getInformation().updatePlace();
                     });
                  })
                  .get("/update-place");
            }

            //edit current album
            else if (instance.isModifyAlbum){
               //prefill with name and update on submit

               input
                  .onLoad(function(){
                     $("input[name=id]").val(album.id);
                     var $title = $("input[name=title]").val(album.title);
                     var $description = $("textarea[name=description]").val(album.description);

                     input.onForm(function(){
                           //reflect changes locally
                           album.title = $title.val();
                           album.description = $description.val();
                     });
                  })
                  .get("/update-album");
            }
         });
   },
   /*
    * @private
    */
   _bindNavigationListener : function(){
      instance = this;
      this.$controls
         .bind("mouseleave",function(){
            instance.$controls.hide();
            instance.$controls.isEntered = false;
         })
         .bind("mouseenter",function(){
            instance.$controls.isEntered = true;
         });

      this.$center.bind("click.MapPhotoAlbum",function(event){
         var place = state.getCurrentPlace();
         if (place){
            place.center();
         }
      });
   },
   /*
    * @private
    */
   _bindShareListener : function(){
      var instance = this;
      this.$share
         .unbind("click")
         .bind("click",function(event){
            state = main.getUIState();
            tools = main.getUI().getTools();
            controls = main.getUI().getControls();

            if ( state.getAlbumShareURL() && state.getAlbumShareURL().id == state.getCurrentAlbum().id ){
               tools.openShareURL();
            }
            else {
               url = "/get-album-share";
               id = state.getCurrentAlbum().id;
               main.getClientServer().getShareLink(url,id);
            }
         });
   },
   /*
    * @private
    */
   _bindPlaceListener : function(){
      places = state.getPlaces();
      var instance = this;
      places.forEach(function(place){
         place.addListener("mouseover",function(){
            instance._displayEditControls(place);
         });
         place.addListener("mouseout",function(){
            instance.hideEditControls(true);
         });
      });
   },
   /*
    * @private
    */
   _bindAlbumListener : function(){
      albums = state.getAlbums();
      var instance = this;
      albums.forEach(function(album){
         album.addListener("mouseover",function(){
            instance._displayEditControls(album);
         });
         album.addListener("mouseout", function(){
            instance.hideEditControls(true);
         });
      });
   },

   /*
    * @description This is used as a callback to display the edit controls
    * @param {Album,Place} instance
    * @private
    */
   _displayEditControls : function(element){
      state = main.getUIState();
      controls = main.getUI().getControls();

      if (element.model === 'Album'){
         controls.setModifyAlbum(true);
         state.setCurrentAlbum(element);
      }
      else if(element.model === 'Place'){
         controls.setModifyPlace(true);
         state.setCurrentPlace(element);
      }
      else{
         alert("Unknown class: " + typeof element);
         return;
      }

      // gets the relative pixel position
      projection = main.getMap().getOverlay().getProjection();
      pixel = projection.fromLatLngToContainerPixel(element.getLatLng());
      // add the header height to the position
      pixel.y += main.getUI().getPanel().getHeight();
      // add the height of the marker
      markerSize = element.getSize();
      pixel.y += markerSize.height;
      // add the width of the marker
      pixel.x += markerSize.width/2;
      controls._showMarkerControls({top:pixel.y,left:pixel.x});
   },
};
