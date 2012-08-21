function placeMapControls() {
    main.getMap().getInstance().setOptions({
      mapTypeControlOptions: {
	position: google.maps.ControlPosition.TOP_LEFT,
      },
    });
};

$(document).ready(function(){

  placeMapControls();
  
  $(".mp-slideshow-background").position($(".mp-album-wrapper").position());
  $(".mp-slideshow").position($(".mp-album-wrapper").position());
});
