$(document).ready(function(){

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
	main.getUI().getControls.$delete.trigger("click");
    });
    $("button.mp-delete-photo").click(function(){
	selectPhoto();
	main.getUI().getControls().$delete.trigger("click");
    });
});

/*
  returns the first place
*/
function selectPlace(){
    places = main.getMap().places;
    if(places.length == 0){
	alert ("Need places for test!");
	return null;
    }
    else{
	main.getUI().getState().setCurrentPlace(places[0]);
	main.getUI().getControls().setModifyPlace(true);
	return places[0];
    }
}

/*
  returns the last photo of getPlace()
*/
function selectPhoto(){
    photos = selectPlace().photos;
    photo = photos[photos.length -1];
    main.getUI().getState().setCurrentPhoto(photo);
    main.getUI().getControls().setModifyPhoto(true);
    return photo;
}
	