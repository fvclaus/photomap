$(document).ready(function(){
    $("button.mp-show-place").click(function(){
	places = main.getMap().places;
	if(places.length == 0){
	    alert ("Need places for test!");
	}
	else{
	    place = places[0];
	    place.triggerClick();
	}
    });
});