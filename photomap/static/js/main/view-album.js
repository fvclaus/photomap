function toggleGallery() {
  $gallery = $("#mp-album");
  var album = main.getUI().getAlbum();
  
  if ($gallery.is(":visible")){
    $(".mp-gallery-drop").unbind('drop.UploadDrop');
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
    $(".mp-gallery-drop").bind('drop.UploadDrop',controls.handleGalleryDrop);
  }
};

function exposeListener(){
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

function addFiledrop(){
  $("div.mp-filedrop").filedrop({
  'url': '/insert-photo',
  'allowedfiletypes': ['image/jpeg','image/png'],
  'maxfiles': 1,
  'error': function(err, file) {
    switch(err) {
	case 'BrowserNotSupported':
	    alert('Your browser does not support html5 drag and drop!');
	    break;
	case 'TooManyFiles':
	    alert('You can just upload one photo at a time!');
	    break;
	case 'FileTypeNotAllowed':
	    alert('The file you want to upload has a not-supported file-type. Supported fily-types are: *.jpeg, *.png!');
	    break;
	default:
	    break;
    }
  },
  'data': {
    'title': $("input[name='title']").val(),
    'description': $("input[name='description']").val(),
  },
  'uploadStarted': function(i,file,len){
    $.fancybox.close();
    if ( state.isMultipleUpload() ) {
      $(".mp-option-add").trigger('click');
    }
  }
  });
};

$(document).ready(function(){
  var map = main.getMap();
  var information = main.getUI().getInformation();
  var cursor = main.getUI().getCursor();
  var tools = main.getUI().getTools();


  // add listeners, which are for guests and admins
  map.panoramaListener();
  galleryListener();
  exposeListener();
  
  cursor.setInfoCursor(cursor.styles.info);
  
  // fit fancybox overlay between header and footer on top of map
  tools.fitMask($("#fancybox-overlay"));
  
  $("#mp-album").hide();
  $(".mp-option-to-dashboard").hide();

});

/* 
 * classes are not completely initiated, when DOM is already ready ->
 * therefor when checking something (isAdmin/isInteractive/...) in these classes 
 * you have to wrap it all in a $(window).load() - that way you can
 * wait until the classes are ready, without causing problems with the 
 * jQuery .ready() function!
 * 
 */
$(window).load(function(){

  var map = main.getMap();
  var state = main.getUIState();
  var controls = main.getUI().getControls();
  var cursor = main.getUI().getCursor();
  var page = "albumview";
  
  if ( main.getClientState().isAdmin() ) {
    
    // set page in interactive mode as albumview
    state.setModeInteractive(true,page);
    
    // add admin listeners
    addFiledrop();
    map.bindListener();
    iframeListener();
    controls.bindListener();
    controls.markerControlListener('place');
    $("#mp-album-wrapper").bind('drop',controls.handleGalleryDrop);;
    
    // change cursor style on map (has to be inside .load() cause it depends on state.isInteractive()
    cursor.setMapCursor();
    
    $(".mp-option-to-dashboard").show();
  }
  else {
    state.setModeInteractive(false,page);
    
    // change map styling if user is guest
    map.setGuestStyle();
  }
});
