/*global $, main, google*/
/*
  UITest.js
  @author Frederik Claus
  @description adds listener to test buttons to initate actions which are otherwise complicated or impossible to trigger
 */

"use strict";

var latLngAlbum, latLngPlace, state, places, place, photos, photo, albums, album, event, gmap, center;


/*
  @author: Frederik Claus
  @summary: selects and returns the last place
*/
function selectPlace() {
   state = main.getUIState();
   places = state.getPlaces();
   place = places[places.length - 1];
   if (places.length === 0) {
      alert("Need places for test!");
      return null;
   } else {
      state.setCurrentPlace(place);
      state.setCurrentLoadedPlace(place);
      main.getUI().getControls().setModifyPlace(true);
      return place;
   }
}

/*
  @author: Frederik Claus
  @summary: selects and returns the last album
*/
function selectAlbum() {
   albums = main.getUIState().getAlbums();
   album = albums[albums.length - 1];
   main.getUIState().setCurrentAlbum(album);
   main.getUI().getControls().setModifyAlbum(true);
   return album;
}

/*
  @author: Frederik Claus
  @summary: select and returns the last photo of getPlace()
*/
function selectPhoto() {
   photos = selectPlace().photos;
   photo = photos[photos.length - 1];
   main.getUIState().setCurrentPhoto(photo);
   main.getUI().getControls().setModifyPhoto(true);
   return photo;
}

function initializeTest() {
   gmap = main.getMap().getInstance();

   // calculate random bounds and add listener. remove google maps listener afterwards
   var listener = google.maps.event.addListener(gmap, "center_changed", function () {

      latLngAlbum = new google.maps.LatLng(Math.random()*42, Math.random()*42);
      center = gmap.getCenter();
      latLngPlace = new google.maps.LatLng(center.lat() - Math.random(), center.lng() + Math.random());

      bindListener();
      google.maps.event.removeListener(listener);

   });

}

function bindListener() {
   var controls = main.getUI().getControls();


   $("button.mp-insert-place").click(function () {
      event = {
         latLng : latLngPlace
      };
      google.maps.event.trigger(gmap, "click", event);
   });
   $("button.mp-show-place").click(function () {
      place = selectPlace();
      place.triggerClick();
   });
   $("button.mp-show-photo").click(function () {
      photo = selectPhoto();
      photo.triggerClick();
   });
   $("button.mp-update-place").click(function () {
      selectPlace();
      controls.$update.trigger("click");
   });
   $("button.mp-update-photo").click(function () {
      selectPhoto();
      controls.$update.trigger("click");
   });
   $("button.mp-delete-place").click(function () {
      selectPlace(); 
      controls.$delete.trigger("click");
   });
   $("button.mp-delete-photo").click(function () {
      selectPhoto();
      controls.$delete.trigger("click");
   });
   $("button.mp-insert-album").click(function () {
      event = {
         latLng : latLngAlbum
      };
      google.maps.event.trigger(gmap, "click", event);
   });
   $("button.mp-update-album").click(function () {
      selectAlbum();
      controls.$update.trigger("click");
   });
   $("button.mp-delete-album").click(function () {
      selectAlbum();
      controls.$delete.trigger("click");
   });
   $("button.mp-show-album-share").click(function () {
      selectAlbum();
      controls.$share.trigger("click");
   });
}

