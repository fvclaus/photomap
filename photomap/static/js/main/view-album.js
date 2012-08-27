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
