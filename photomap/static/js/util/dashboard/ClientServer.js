/*jslint */
/*global $, main, Album */

"use strict";

/**
 * @author Frederik Claus
 * @class ClientServer handles interactions between client and server
 */

var ClientServer;

ClientServer = function () {
   // array of albums
   this.albums = [];
};

/**
 * @author Marc-Leon Römer
 * @description Gets all albums of user, defines handler to get share-link and delete albums
 */

ClientServer.prototype = {
   init : function () {
      // make an AJAX call to get the places from the XML file, and display them on the Map
      this._getAlbums();
   },
   getShareLink : function (url, id) {
      
       // get request for share link - data is album id
      $.ajax({
         type: "get",
         dataType: "json",
         "url": url,
         data: {
            "id" : id
         },
         success : function (data) {
            if (data.error) {
               alert(data.error);
            } else {
               main.getUIState().setAlbumShareURL(data.url, id);
               main.getUI().getTools().openShareURL();
            }
         },
         error : function (err) {
            alert(err.toString());
         }
      });
   },
   deleteObject : function (url, data) {
      
      var ui, state;
      state = main.getUIState();
      ui = main.getUI();
      
      $.ajax({
         type : "post",
         dataType : "json",
         "url" : url,
         data : {
            id : data.id
         },
         success : function (response) {
            if (response.error) {
               alert(response.error);
            } else {
               
               if (data.model === "Album") {
                  
                  ui.removeAlbum(data.id);
               
               } else {
                  alert("The deleted Object has no model and therefor couldn't be removed from ui");
               }
            }
         },
         error : function (err) {
            alert(err.toString());
         }
      });
   },
   /**
    * @private
    */
   _getAlbums : function () {
      var instance = this;
      // get the albums and their info
      $.ajax({
         "url" : 'get-all-albums',
         success :  function (albumsinfo) {
            
            var map, album;
            map = main.getMap();

            // in case there are no albums yet show world map
            if (albumsinfo.length === 0) {
               map.showWorld();
               main.initAfterAjax();
               return;
            }

            albumsinfo.forEach(function (albuminfo) {
               album = new Album(albuminfo);
               instance.albums.push(album);
            });

            main.getUIState().setAlbums(instance.albums);

            instance._showAlbums(instance.albums);

         }
      });
   },
   /**
    * @private
    */
   _showAlbums : function (albums) {
      var map = main.getMap();
      map.showAsMarker(albums);
      
      main.initAfterAjax();
   }
};
