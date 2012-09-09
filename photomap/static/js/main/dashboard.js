var map,controls,state,tools;

$(document).ready(function(){
  map = main.getMap();
  state = main.getUIState();
  controls = main.getUI().getControls();
  tools = main.getUI().getTools();
  
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
