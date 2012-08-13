var $container;

function repositionContent(){    
    position = $(".mp-map").position();
    height = position.top;
    width = ( $(".mp-map").width() - $container.width() ) * 0.5;
    $container.css('top',height).css('left',width);
};


function initScrollPane() {
    $(".mp-content-container").jScrollPane();
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
    $container = $(".mp-non-interactive-content");  
    $(window).resize(function(){
      repositionContent();
      initScrollPane();
    });
    
    hideMapControls();
    setZoom(20);
    repositionContent();
});

