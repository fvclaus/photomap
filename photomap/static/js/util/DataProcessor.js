/*jslint */
/*global $, define, main, TEMP_DESCRIPTION_KEY, TEMP_TITLE_KEY, assertTrue */

"use strict";

/**
 * @author Marc-Leon Roemer
 * @class Processes data loaded from server and fits it into models.
 */


define(["dojo/_base/declare", "model/Photo", "model/Place", "model/Album", "util/Communicator", "ui/UIState"],
       function(declare, Photo, Place, Album, communicator, state) {
          
          var DataProcessor = declare(null, {
             
             constructor : function () {
                communicator.subscribe("insert:photo", this._processInsertPhoto, this);
                communicator.subscribe("insert:place", this._processInsertPlace, this);
                communicator.subscribe("insert:album", this._processInsertAlbum, this);
                communicator.subscribeOnce("loaded:initialData", this._processInitialData, this);
             },
             
             /**
              * @private
              */
             _processInsertPhoto : function (data) {
                
                var photo = this._createPhoto(data);
                
                communicator.publish("processed:photo", photo);
             },
             /**
              * @private
              */
             _processInsertPlace : function (data) {
                
                var place = this._createPlace(data);
                
                communicator.publish("processed:place", place);
             },
             /**
              * @private
              */
             _processInsertAlbum : function (data) {
                
                var album = this._createAlbum(data);
                
                communicator.publish("processed:album", album);
             },
             /**
              * @private
              */
             _processInitialData : function (data) {
                assertTrue(state.isAlbumView() || state.isDashboardView(), "current view has to be either albumview or dashboardview");
                
                var processedData;
                
                if (state.isAlbumView()) {
                   state.setCurrentLoadedAlbum(this._createAlbum(data));
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
                
                state.insertPlace(place);
                
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
                
                state.insertAlbum(album);
                
                return album;
             }
          }),
              
          _instance = new DataProcessor();
          return _instance;
       });
