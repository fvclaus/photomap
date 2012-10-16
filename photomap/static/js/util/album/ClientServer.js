ClientServer = function() {
   // array of places
   this.uploadedPhotos = new Array();
};

ClientServer.prototype = {
   init : function() {
      // make an AJAX call to get the places from the XML file, and display them on the Map
      this._getPlaces();
   },
   savePhotoOrder : function(photos){
      photos.forEach(function(photo){
         // post request for each photo with updated order
         $.ajax({
            url : "/update-photo",
            type : "post",
            data : {
               'id': photo.id,
               'order': photo.order,
            }
         });
      });
   },
   _getPlaces : function() {
      var instance = this;
      tools = main.getUI().getTools();
      id = tools.getUrlId();
      secret = tools.getUrlSecret();

      $.ajax({
         "url" : "get-album",
         data : {
            "id" : id,
            "secret" : secret,
         },
         success: function( albuminfo ) {
            // set current album in UIState to have access on it for information, etc.
            main.getUIState().setCurrentAlbum(albuminfo);
            // set album title in title-bar
            main.getUI().getInformation().updateAlbumTitle();

            // in case there are no places yet show map around album marker
            if ((albuminfo.places == null) || (albuminfo.places.length == 0)) {
               main.getMap().expandBounds(albuminfo);
               main.initAfterAjax();
               return;
            }

            var places = new Array();

            albuminfo.places.forEach(function(placeinfo){
               var place = new Place( placeinfo )
               places.push( place );
            });
            // add to UIState
            main.getUIState().setPlaces(places);

            instance._showPlaces(places)
         }
      });

   },
   _showPlaces : function(places) {
      var map = main.getMap();

      places = this._sortPhotos(places);
      map.showAsMarker(places);
      
      main.initAfterAjax();
   },
   /*
    * @private
    */
   _sortPhotos : function(places){

      places.forEach(function(place){
         console.dir(place.photos);
         copy = place.photos;
         noOrder = new Array();
         place.photos = new Array();
         // puts photos with order on the right position
         // order : 6 place.photos[5] = photo
         copy.forEach(function(photo,index){
            if (photo.order && parseInt(photo.order) != NaN){
               place.photos[photo.order] = photo;
            }
            else{
               noOrder.push(photo);
            }
         });
         console.dir(place.photos);
         console.log('--------');
         // fills up null values in place.photo with fifo no order photos
         noOrder.forEach(function(photo){
            if (photo == null){
               return;
            }
            nullIndex = arrayExtension.firstUndef(place.photos);
            if (nullIndex != -1){
               place.photos[nullIndex] = photo;
            }
            else {
               place.photos.push(photo);
            }
         });
         console.dir(place.photos);
      });

      return places;
   },
};
