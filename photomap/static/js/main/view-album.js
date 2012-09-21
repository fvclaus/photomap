var album,information,tools,map;

function toggleGallery() {
    $gallery = $("#mp-album");
    
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

function exposeListener(){
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
  });
};
function iframeListener(){
  $("body").bind('iframe_close',function(){
    main.getClientServer().reloadAlbum();
    mpEvents.trigger("body",mpEvents.toggleExpose);
  });
};
function galleryListener(){
  $(".mp-option-toggle-gallery").bind("click",function(){
    toggleGallery();
  });
};

$(document).ready(function(){
  map = main.getMap();
  state = main.getUIState();
  album = main.getUI().getAlbum();
  information = main.getUI().getInformation();
  cursor = main.getUI().getCursor();
  tools = main.getUI().getTools();
  page = "albumview";
  
  if ( main.getClientState().isAdmin() ) {
    // set page in interactive mode as albumview
    state.setModeInteractive(true,page);
    
    // activate listeners
    map.bindListener();
    map.panoramaListener();
    galleryListener();
    iframeListener();
    exposeListener();
  }
  else {
    state.setModeInteractive(false,page);
    
    // change map styling if user is guest
    map.setGuestStyle();
  }
  
  //adjust map controls
  position = google.maps.ControlPosition;
  map.placeControls(position.TOP_LEFT,undefined,undefined,undefined);
  
  cursor.setInfoCursor(cursor.styles.info);
  cursor.setMapCursor();
  
  
  // fit fancybox overlay between header and footer on top of map
  tools.fitMask($("#fancybox-overlay"));
  
  $("#mp-album").hide();

});
