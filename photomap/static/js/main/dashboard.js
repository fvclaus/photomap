$(document).ready(function(){
  map = main.getMap();
  state = main.getUIState();
  controls = main.getUI().getControls();
  tools = main.getUI().getTools();
  cursor = main.getUI().getCursor();
  page = DASHBOARD_VIEW;
  
  // set page in interactive mode as dashboard
  state.setModeInteractive(true,page);
  
  // activate listeners
  map.bindListener();
  controls.bindListener(page);

  
  cursor.setMapCursor();
  
  // fit fancybox overlay between header and footer on top of map
  tools.fitMask($("#fancybox-overlay"));
});

//~ $(window).load(function(){
  //~ controls = main.getUI().getControls();
  //~ 
  //~ // has to be added after all albums are loaded (with markers) -> in $(window).load()
  //~ controls.markerControlListener('album');
//~ });
