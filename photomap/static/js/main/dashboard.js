var map,controls,state;

$(document).ready(function(){
  map = main.getMap();
  controls = main.getUI().getControls();
  state = main.getUIState();
  
  // set page in interactive mode as dashboard
  page = "dashboard";
  state.setModeInteractive(page);
  
  position = google.maps.ControlPosition
  map.placeControls(position.TOP_CENTER,undefined,undefined,undefined);
  
  // activate listeners
  map.activateBindListener();
  controls.bindExportListener();
  
  // fit fancybox overlay between header and footer on top of map
  tools.fitMask($("#fancybox-overlay"));
});
