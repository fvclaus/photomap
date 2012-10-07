
/*
 * @description Does some dashboard specific initialization
 */
function initialize(){
	// this can be removed to and integrated into the Map and UIControls class
	map = main.getMap();
  state = main.getUIState();
  controls = main.getUI().getControls();
  tools = main.getUI().getTools();
  cursor = main.getUI().getCursor();
	map.bindListener();
  controls.bindListener(state.getPage());
  cursor.setMapCursor();
  
  // fit fancybox overlay between header and footer on top of map
  tools.fitMask($("#fancybox-overlay"));
}

//~ $(document).ready(function(){
  //~ map = main.getMap();
  //~ state = main.getUIState();
  //~ controls = main.getUI().getControls();
  //~ tools = main.getUI().getTools();
  //~ cursor = main.getUI().getCursor();
  //~ page = DASHBOARD_VIEW;
  //~ 
  //~ // set page in interactive mode as dashboard
  //~ state.setInteractive(true,page);
  //~ 
  //~ // activate listeners
//~ 
//~ 
  //~ 
  //~ cursor.setMapCursor();
  //~ 
  //~ // fit fancybox overlay between header and footer on top of map
  //~ tools.fitMask($("#fancybox-overlay"));
//~ });

//~ $(window).load(function(){
  //~ controls = main.getUI().getControls();
  //~ 
  //~ // has to be added after all albums are loaded (with markers) -> in $(window).load()
  //~ controls.markerControlListener('album');
//~ });
