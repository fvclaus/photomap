$(document).ready(function(){
  map = main.getMap();
  state = main.getUIState();
  controls = main.getUI().getControls();
  tools = main.getUI().getTools();
  cursor = main.getUI().getCursor();
  page = "dashboard";
  
  // set page in interactive mode as dashboard
  state.setModeInteractive(true,page);
  
  // activate listeners
  map.bindListener();
  controls.bindShareListener();
  
  position = google.maps.ControlPosition
  map.placeControls(position.TOP_CENTER,undefined,undefined,undefined);
  cursor.setMapCursor();
  
  // fit fancybox overlay between header and footer on top of map
  tools.fitMask($("#fancybox-overlay"));
});
