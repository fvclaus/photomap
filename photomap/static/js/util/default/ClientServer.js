ClientServer = function(){
   this.albums  = new Array();
};

ClientServer.prototype = {
   init: function(){
      this._getAlbums();
   },
   _getAlbums: function(callback){
      var instance = this;
      $.ajax({
         "url":"get-all-albums",
         success : function(albums) {

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
   }
};
