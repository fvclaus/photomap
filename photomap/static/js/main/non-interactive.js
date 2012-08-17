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
    $(window).resize(function(){
      repositionContent();
      initScrollPane();
    });
    
    hideMapControls();
    setZoom(20);
    repositionContent();
    initScrollPane();
});

