var map,controls,state,tools;

$(document).ready(function(){
  map = main.getMap();
  state = main.getUIState();
  controls = main.getUI().getControls();
  tools = main.getUI().getTools();
  
  page = "dashboard";
  
  if ( main.getClientState().isAdmin() ){
    // set page in interactive mode as dashboard
    state.setModeInteractive(true,page);
    
    // activate listeners
    map.bindListener();
    controls.bindExportListener();
  }
  else {
    state.setModeInteractive(false,page);
  }
  
  position = google.maps.ControlPosition
  map.placeControls(position.TOP_CENTER,undefined,undefined,undefined);
  
  // fit fancybox overlay between header and footer on top of map
  tools.fitMask($("#fancybox-overlay"));
});
