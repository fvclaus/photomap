function toggleGallery() {
  $gallery = $("#mp-album");
  var album = main.getUI().getAlbum();
  
  if ($gallery.is(":visible")){
    $gallery.fadeOut(100);
    $(".mp-gallery-visible").hide()
    $(".mp-gallery-hidden").show()
    // trigger event to expose album
    album._setVisibility(false);
    mpEvents.trigger("body",mpEvents.toggleExpose);
    
  }
  else {
    $gallery.fadeIn(500);
    $(".mp-gallery-hidden").hide()
    $(".mp-gallery-visible").show()
    // trigger event to close mask
    album._setVisibility(true);
    mpEvents.trigger("body",mpEvents.toggleExpose);
  }
};

function bindExposeListener(){
  var album = main.getUI().getAlbum();
  
  $("body").bind('toggleExpose',function(){
    // change exposé depending on visibility of gallery and description
    if (information.isVisible() && album.isVisible()){
      if ($.mask.isLoaded() == "full"){
	  $.mask.close();
      }
      $("#mp-album, #mp-description").expose({'opacity': 0.7, 'closeSpeed': 0});
      tools.fitMask($("#exposeMask"));
    }
    else if (!information.isVisible() && album.isVisible()){
      $("#mp-album").expose({'opacity': 0.7, 'closeSpeed': 0});
      tools.fitMask($("#exposeMask"));
    }
    else if (information.isVisible() && !album.isVisible()){
      $("#mp-description").expose({'opacity': 0.7, 'closeSpeed': 0});
      tools.fitMask($("#exposeMask"));
    }
    else {
      $.mask.close();
    }
    // z-index has to be more than mask but less than controls
    $("#mp-album").css('z-index',1025);
    $("#mp-description").css('z-index',1025);
  });
};
function bindIFrameListener(){
  $("body").bind('iframe_close',function(){
    state.setFileToUpload(null);
    mpEvents.trigger("body",mpEvents.toggleExpose);
  });
};
function bindGalleryListener(){
  $(".mp-option-toggle-gallery").bind("click",function(){
    toggleGallery();
  });
};

function initialize(){
  var map = main.getMap();
  var information = main.getUI().getInformation();
  var cursor = main.getUI().getCursor();
  var tools = main.getUI().getTools();
	var state = main.getUIState();
	var controls = main.getUI().getControls();

  // add listeners, which are for guests and admins
  //~ map._bindPanoramaListener();
  bindGalleryListener();
  bindExposeListener();
  
  cursor.setInfoCursor(cursor.styles.info);
  
  // fit fancybox overlay between header and footer on top of map
  tools.fitMask($("#fancybox-overlay"));
  
  $("#mp-album").hide();
  $(".mp-option-to-dashboard").hide();
  
  if ( main.getClientState().isAdmin() ) {
    
    // add admin listeners
    map.bindListener(state.getPage());
    bindIFrameListener();
    controls.bindListener(state.getPage());
    
    // setup the dnd listeners
    $('#mp-album').bind('dragover', controls.handleDragOver);
    $('#mp-album').bind('drop', controls.handleGalleryDrop);
    // change cursor style on map (has to be inside .load() cause it depends on state.isInteractive()
    cursor.setMapCursor();
    
    $(".mp-option-to-dashboard").show();
  }
  else {
    
    // change map styling if user is guest
    map.setGuestStyle();
  }
}

/* 
 * classes are not completely initiated, when DOM is already ready ->
 * therefor when checking something (isAdmin/isInteractive/...) in these classes 
 * you have to wrap it all in a $(window).load() - that way you can
	 * wait until the classes are ready, without causing problems with the 
 * jQuery .ready() function!
 * 
 */

