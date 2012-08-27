  
function placeLoginForms(){
    $login = $container.find("#mp-login");
    $register = $container.find("#mp-register");
    
    // resizing
    loginheight = $container.height();
    registerheight = loginheight;
    $login.height(loginheight);
    $register.height(registerheight);
    
    // repositioning
    height = $container.height();
    loginMarginTop = height * 0.25;
    registerMarginTop = height * 0.25;
    $login.find("form").css('margin-top',loginMarginTop);
    $register.find("form").css('margin-top',registerMarginTop);
};

$(document).ready(function(){
    $(".mp-panel-controls-wrapper").hide();
    
    placeLoginForms();
});    

