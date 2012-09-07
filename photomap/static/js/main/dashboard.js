function placeMapControls() {
    main.getMap().getInstance().setOptions({
      mapTypeControlOptions: {
	position: google.maps.ControlPosition.TOP_CENTER,
      },
    });
};

$(document).ready(function(){
  // set page in interactive mode as dashboard
  page = "dashboard";
  main.getUI().getState().setModeInteractive(page);
  
  placeMapControls();
  
  // activate map listener
  main.getMap().activateBindListener();
  // activate export listener
  main.getUI().getControls().bindExportListener();
  
});
