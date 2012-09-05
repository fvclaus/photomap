function placeMapControls() {
    main.getMap().getInstance().setOptions({
      mapTypeControlOptions: {
	position: google.maps.ControlPosition.TOP_LEFT,
      },
    });
};

function toggleGallery() {
    $gallery = $("#mp-album");
    if ($gallery.is(":visible")){
      $gallery.fadeOut(100);
      $(".mp-gallery-visible").hide()
      $(".mp-gallery-hidden").show()
    }
    else {
      $gallery.fadeIn(500);
      $(".mp-gallery-hidden").hide()
      $(".mp-gallery-visible").show()
    }
};

function AddEvent(html_element, event_name, event_function) {       
   if(html_element.attachEvent) //Internet Explorer
      html_element.attachEvent("on" + event_name, function() {event_function.call(html_element);}); 
   else if(html_element.addEventListener) //Firefox & company
      html_element.addEventListener(event_name, event_function, false); //don't need the 'call' trick because in FF everything already works in the right way          
};

function AddEvent2() {
  var event = jQuery.Event("iframe_close");
  // to trigger this event: 
  jQuery("body").trigger( e );
};

$(document).ready(function(){
  // set page in interactive mode as albumview
  page = "albumview";
  main.getUIState().setModeInteractive(page);
  
  cursor = main.getUI().getCursor();
  cursor.setInfoCursor(cursor.cursor.info);
  
  placeMapControls();
  // activate map listener
  main.getMap().activateBindListener();
  
  $(".mp-slideshow-background").position($(".mp-album-wrapper").position());
  $(".mp-slideshow").position($(".mp-album-wrapper").position());
  $("#mp-album").hide();

  $(".mp-option-toggle-gallery").bind("click",function(){
    toggleGallery();
  });
});
