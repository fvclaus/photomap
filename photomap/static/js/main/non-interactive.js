var $container;

function repositionContent(){    
    position = $(".mp-map").position();
    top = position.top;
    left = ( $(".mp-map").width() - $container.width() ) * 0.5;
    $container.css({'top':top,'left':left,});
};


function initScrollPane() {
    $container.jScrollPane();
};


function hideMapControls() {
    main.getMap().getInstance().setOptions({
      panControl: false,
      zoomControl: false,
      streetViewControl: false,
      mapTypeControlOptions: {
	position: google.maps.ControlPosition.TOP_LEFT,
      },
    });
};

function setZoom(number) {
    main.getMap().getInstance().setZoom(number);
};


$(document).ready(function(){
    $container = $("#mp-non-interactive-content");
    ui = main.getUI();
    // set page mode to non-interactive
    ui.getState().setModeNonInteractive();
    // change cursor on map from cross to grabber - besides moving the map is non-interactive
    ui.getCursor().setMapCursor(ui.getCursor().cursor.grab)
    
    hideMapControls();
    repositionContent();
    initScrollPane();
    
    // if window is resized content container needs to be repositioned
    $(window).resize(function(){
      repositionContent();
      initScrollPane();
    });
    
    // if there is a part of the content specified in the uri (by id) then scroll to that part
    hash = window.location.hash;
    if (hash){
	api = $container.jScrollPane().data('jsp');
	api.scrollToElement(hash,true,true);
    }
});

