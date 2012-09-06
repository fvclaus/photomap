function placeMapControls() {
    main.getMap().getInstance().setOptions({
      mapTypeControlOptions: {
	position: google.maps.ControlPosition.TOP_LEFT,
      },
    });
};

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

function placeExposeMask(){
    $("#mp-expose-mask").css({
      'max-height': $('#mp-map').height(),
      'max-width': $('#mp-map').width(),
      'top': $('#mp-map').offset().top,
      'left': $('#mp-map').offset().left,
    });
};

function AddEvent(html_element, event_name, event_function) {       
   if(html_element.attachEvent) //Internet Explorer
      html_element.attachEvent("on" + event_name, function() {event_function.call(html_element);}); 
   else if(html_element.addEventListener) //Firefox & company
      html_element.addEventListener(event_name, event_function, false); //don't need the 'call' trick because in FF everything already works in the right way          
};

function exposeListener(){
  $("body").bind('toggleExpose',function(){
    var album = main.getUI().getAlbum();
    var information = main.getUI().getInformation();
    // change exposé depending on visibility of gallery and description
    if (information.isVisible() && album.isVisible()){
      if ($.mask.isLoaded() == "full"){
	  $.mask.close();
      }
      $("#mp-album, #mp-description").expose({'maskId': 'mp-expose-mask', 'opacity': 0.7, 'closeSpeed': 0});
      placeExposeMask();
    }
    else if (!information.isVisible() && album.isVisible()){
      $("#mp-album").expose({'maskId': 'mp-expose-mask', 'opacity': 0.7, 'closeSpeed': 0});
      placeExposeMask();
    }
    else if (information.isVisible() && !album.isVisible()){
      $("#mp-description").expose({'maskId': 'mp-expose-mask', 'opacity': 0.7, 'closeSpeed': 0});
      placeExposeMask();
    }
    else {
      $.mask.close();
    }
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
  // set page in interactive mode as albumview
  page = "albumview";
  main.getUIState().setModeInteractive(page);
  
  cursor = main.getUI().getCursor();
  cursor.setInfoCursor(cursor.cursor.info);
  
  placeMapControls();
  // activate map listener and other listeners
  main.getMap().activateBindListener();
  galleryListener();
  iframeListener();
  exposeListener();
  
  $(".mp-slideshow-background").position($(".mp-album-wrapper").position());
  $(".mp-slideshow").position($(".mp-album-wrapper").position());
  $("#mp-album").hide();

});
