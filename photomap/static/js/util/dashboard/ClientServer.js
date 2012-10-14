ClientServer = function() {
   // array of albums
   this.albums = new Array();
};

ClientServer.prototype = {
   init : function() {
      // make an AJAX call to get the places from the XML file, and display them on the Map
      this._getAlbums();
   },
   _getAlbums : function() {
      var instance = this;
      // get the albums and their info
      $.ajax({
         "url" : 'get-all-albums',
         success :  function( albumsinfo ) {

            map = main.getMap();

            // in case there are no albums yet show world map
            if (albumsinfo.length == 0){
               map.showWorld();
               return;
            }
            else if (albumsinfo.length == 1){
               map.zoomOut(albumsinfo[0].lat,albumsinfo[0].lon);
            }

            albumsinfo.forEach(function(albuminfo){
               album = new Album( albuminfo)
               instance.albums.push( album );
            });

            main.getUIState().setAlbums(instance.albums);

            instance._showAlbums(instance.albums);

         }
      });
   },
   _showAlbums : function(albums) {
      var map = main.getMap();
      map.showAsMarker(albums);
      
      main.initAfterAjax();
   },

   getShareLink : function(url,id){
      data = {'id': id};
       // get request for share link - data is album id
      $.ajax({
         type: "get",
         dataType: "json",
         "url": url,
         "data": data,
         success : function(data){
            if (data.error){
               alert(data.error);
            }
            else{
               main.getUIState().setAlbumShareURL(data.url,id);
               main.getUI().getTools().openShareURL();
            }
         },
         error : function(err){
            alert(err.toString());
         },
      });
   },
};