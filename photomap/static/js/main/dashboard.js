function placeMapControls() {
    main.getMap().getInstance().setOptions({
      mapTypeControlOptions: {
	position: google.maps.ControlPosition.TOP_CENTER,
      },
    });
};

$(document).ready(function(){

  placeMapControls();
  
  page = "dashboard";
  main.getUI().getState().setModeInteractive(page);
});
