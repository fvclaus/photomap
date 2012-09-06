/*
  UITest.js
  @author: Frederik Claus
  @summary: adds listener to test buttons to initate actions which are otherwise complicated or impossible to trigger
*/

var latLngAlbum,latLngPlace;

$(document).ready(function(){
    var map = main.getMap().getInstance();

    // calculate random bounds and add listener. remove google maps listener afterwards
    var listener = google.maps.event.addListener(map,"center_changed",function(){

	latLngAlbum = new google.maps.LatLng(Math.random()*42,Math.random()*42);
	center = map.getCenter();
	latLngPlace = new google.maps.LatLng(center.lat() - Math.random(), center.lng() + Math.random());
	
	bindListener();
	google.maps.event.removeListener(listener);
	
    });

});

function bindListener(){

    $("button.mp-insert-place").click(function(){
	event = {
	    latLng : latLngPlace
	};
	google.maps.event.trigger(main.getMap().getInstance(), "click",event);
    });
    $("button.mp-show-place").click(function(){
	place = selectPlace();
	place.triggerClick();
    });
    $("button.mp-show-photo").click(function(){
	photo = selectPhoto();
	photo.triggerClick();
    });
    $("button.mp-update-place").click(function(){
	selectPlace();
	main.getUI().getControls().$update.trigger("click");
    });
    $("button.mp-update-photo").click(function(){
	selectPhoto();
	main.getUI().getControls().$update.trigger("click");
    });
    $("button.mp-delete-place").click(function(){
	selectPlace();
	main.getUI().getControls().$delete.trigger("click");
    });
    $("button.mp-delete-photo").click(function(){
	selectPhoto();
	main.getUI().getControls().$delete.trigger("click");
    });
    $("button.mp-insert-album").click(function(){
	event = {
	    latLng : latLngAlbum
	};
	google.maps.event.trigger(main.getMap().getInstance(),"click",event);
    });
    $("button.mp-update-album").click(function(){
	selectAlbum();
	main.getUI().getControls().$update.trigger("click");
    });
    $("button.mp-delete-album").click(function(){
	selectAlbum();
	main.getUI().getControls().$delete.trigger("click");
    });
}    

/*
  @author: Frederik Claus
  @summary: selects and returns the first place
  @edited: by Marc Leon Römer - now selects last place if this place exists
  * else the wrong place will get updated in test suite -> assert text won't work
*/
function selectPlace(){
    places = main.getUIState().getPlaces();
    place = places[places.length - 1];
    if(places.length == 0){
	alert ("Need places for test!");
	return null;
    }
    else{
	//main.getUI().getState().setCurrentPlace(places[0]);
	main.getUI().getControls().setModifyPlace(true);
	//return places[0];
	return place;
    }
}

/*
  @author: Frederik Claus
  @summary: select and returns the last photo of getPlace()
*/
function selectPhoto(){
    photos = selectPlace().photos;
    photo = photos[photos.length -1];
    main.getUI().getState().setCurrentPhoto(photo);
    main.getUI().getControls().setModifyPhoto(true);
    return photo;
}

/*
  @author: Frederik Claus
  @summary: selects and returns the last album
*/
function selectAlbum(){
    albums = main.getUIState().getAlbums();
    album = albums[albums.length -1]; 
    main.getUI().getState().setCurrentAlbum(album);
    main.getUI().getControls().setModifyAlbum(true);
    return album;
}
