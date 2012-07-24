var repositionContent : function(){
    $container = $("div.mp-content-container");
    
    position = $(".mp-map").position();
    height = position.top + (( $(".mp-map").height() - $(".mp-footer").height() - $container.height() ) * 0.5);
    width = ( $(".mp-map").width() - $container.width() ) * 0.5;
    $container.css('top',height).css('left',width);
  },
  
var plantLoginForms = function(){
    $container = $("div.mp-content-container");
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

$(document).ready(function(){
  
    repositionContent();
    plantLoginForms();
    
};
