var repositionContent = function(){
    $container = $(".mp-content-container");
    
    position = $(".mp-map").position();
    height = position.top;
    width = ( $(".mp-map").width() - $container.width() ) * 0.5;
    $container.css('top',height).css('left',width);
};
  
var placeLoginForms = function(){
    $container = $(".mp-content-container");
    $login = $container.find("#mp-login");
    $register = $container.find("#mp-register");
    
    // resizing
    loginheight = $container.height();
    registerheight = loginheight;
    $login.height(loginheight);
    $register.height(registerheight);
    
    // repositioning
    height = container.height();
    loginMarginTop = height * 0.25;
    registerMarginTop = height * 0.25;
    $login.find("form").css('margin-top',loginMarginTop);
    $register.find("form").css('margin-top',registerMarginTop);
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
  
    $(window).resize(function(){
      repositionContent();
      initScrollPane();
    });
      
  
    hideMapControls();
    setZoom(20);
  
    repositionContent();
    
    if ($("body").find("#mp-login").attr("class") == "mp-login"){
      placeLoginForms();
    };
    
    initScrollPane();
});
