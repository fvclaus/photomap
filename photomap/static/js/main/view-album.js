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

  placeMapControls();
  $("#mp-album").hide();
  
  $(".mp-slideshow-background").position($(".mp-album-wrapper").position());
  $(".mp-slideshow").position($(".mp-album-wrapper").position());
  
  page = "albumview";
  main.getUI().getState().setModeInteractive(page);
  
  $(".mp-option-toggle-gallery").bind("click",function(){
    toggleGallery();
  });
});
