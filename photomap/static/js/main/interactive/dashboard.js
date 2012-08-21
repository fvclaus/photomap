function placeMapControls() {
    main.getMap().getInstance().setOptions({
      mapTypeControlOptions: {
	position: google.maps.ControlPosition.TOP_LEFT,
      },
    });
};

$(document).ready(function(){

  placeMapControls();
  
  main.getUI().getState().resetAlbumView();
});
