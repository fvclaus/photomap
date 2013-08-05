/*jslint */
/*global $, define, main, TEMP_DESCRIPTION_KEY, TEMP_TITLE_KEY, assertTrue */

"use strict";

/**
 * @author Marc-Leon Roemer
 * @class Processes data loaded from server and fits it into models.
 */


define(["dojo/_base/declare",
        "model/Photo",
        "model/Place",
        "model/Album",
        "util/Communicator",
        "ui/UIState",
       "util/ClientState"],
       function(declare, Photo, Place, Album, communicator, state, clientstate) {
          
          var DataProcessor = declare(null, {
             
             constructor : function () {
                //communicator.subscribeOnce("loaded:initialData", this._processInitialData, this);
             },
             /**
              * @private
              */
             _processInitialData : function (data) {
                assertTrue(state.isAlbumView() || state.isDashboardView(), "current view has to be either albumview or dashboardview");
                
                var processedData;
                
                if (state.isAlbumView()) {
                   state.setAlbum(this._createAlbum(data));
                   processedData = this._createPlacesOrAlbums(data.places, "Place");
                   processedData = this._sortPhotos(processedData);
                } else if (state.isDashboardView()) {
                   processedData = this._createPlacesOrAlbums(data, "Album");
                }
                console.dir(processedData);
                communicator.publish("init", processedData);
             },
             /**
              * @private
              */
             _createPlacesOrAlbums : function (data, model) {
                assertTrue(model === "Album" || model === "Place", "model has to be either Place or Album");
                
                var placeOrAlbum,
                    placesOrAlbums = [],
                    instance = this;
                
                $.each(data, function (index, placeOrAlbumData) {
                   if (model === "Album") {
                      placeOrAlbum = instance._createAlbum(placeOrAlbumData);
                   } else if (model === "Place") {
                      placeOrAlbum = instance._createPlace(placeOrAlbumData);
                   }
                   placesOrAlbums.push(placeOrAlbum);
                   
                });
                
                return placesOrAlbums;
             },
             /**
              * @private
              */
             _sortPhotos : function (places) {
                $.each(places, function (index, place) {
                   place.sortPhotos();
                });

                return places;
             },
             /**
              * @private
              */
             _createPhoto : function (data) {
                var photo = new Photo({
                   id : data.id,
                   photo : data.url,
                   thumb : data.thumb,
                   order : data.order || state.getPhotos().length,
                   title : data.title || state.retrieve(TEMP_TITLE_KEY),
                   description : data.description || state.retrieve(TEMP_DESCRIPTION_KEY)
                });

                photo.setVisited(clientstate.isVisitedPhoto(photo));
                
                return photo;
             },
             /**
              * @private
              */
             _createPlace : function (data) {
                var place = new Place({
                       lat: data.lat,
                       lng: data.lng || data.lon,
                       id : data.id,
                       title : data.title || state.retrieve(TEMP_TITLE_KEY),
                       description : data.description || state.retrieve(TEMP_DESCRIPTION_KEY),
                       photos: data.photos || null
                    });
                
                return place;
             },
             /**
              * @private
              */
             _createAlbum : function (data) {
                var album = new Album({
                       lat: data.lat,
                       lng: data.lng || data.lon,
                       id : data.id,
                       title : data.title || state.retrieve(TEMP_TITLE_KEY),
                       description : data.description || state.retrieve(TEMP_DESCRIPTION_KEY),
                       secret : data.secret,
                       isOwner : data.isOwner || false
                    });
                
                return album;
             }
          }),
              
          _instance = new DataProcessor();
          return _instance;
       });
