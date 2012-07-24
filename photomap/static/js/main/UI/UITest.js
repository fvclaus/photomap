$(document).ready(function(){

    $("button.mp-show-place").click(function(){
	place = getPlace();
	place.triggerClick();
    });
    $("button.mp-update-place").click(function(){
	place = getPlace();
	main.getUI().getState().setCurrentPlace(place);
    });
    $("button.mp-update-photo").click(function(){
	photo = getPhoto();
	main.getUI().getState().setCurrentPhoto(photo);
    });
    
});

/*
  returns the first place
*/
function getPlace(){
    places = main.getMap().places;
    if(places.length == 0){
	alert ("Need places for test!");
	return null;
    }
    else{
	return places[0];
    }
}

/*
  returns the last photo of getPlace()
*/
function getPhoto(){
    photos = getPlace().photos;
    photo = photos[photos.length -1];
    return photo;
}
	