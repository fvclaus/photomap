var state,cursor,$container;

function repositionContent(){    
    position = $(".mp-map").position();
    top = position.top;
    left = ( $(".mp-map").width() - $container.width() ) * 0.5;
    $container.css({'top':top,'left':left,});
};

function initScrollPane() {
    $container.jScrollPane();
};

$(document).ready(function(){
    // have to declare the map variable here, no idea why though :S
    var map = main.getMap();
    state = main.getUIState();
    cursor = main.getUI().getCursor();
    $container = $("#mp-non-interactive-content");
    
    // set page mode to non-interactive
    state.setModeNonInteractive();
    // change cursor on map from cross to grabber - besides moving the map is non-interactive
    cursor.setMapCursor(cursor.styles.grab)
    //adjust map controls
    position = google.maps.ControlPosition;
    map.setControls(true,false,false,false);
    map.placeControls(position.TOP_LEFT,undefined,undefined,undefined);
    
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

