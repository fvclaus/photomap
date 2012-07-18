UIContentbox = function(){
  
  this.$container = $("div.mp-content-container");
  this.$login = this.$container.find("#mp-login");
  this.$register = this.$container.find("#mp-register");
};

UIContentbox.prototype = {
  
  init : function(){
    this.resizeRepositionLoginRegistrationForms();
    this.repositionContentbox();
  },
  
  resizeRepositionLoginRegistrationForms : function(){
    // resizing
    loginheight = this.$container.height();
    registerheight = loginheight;
    this.$login.height(loginheight);
    this.$register.height(registerheight);
    // repositioning
    height = this.$container.height();
    loginMarginTop = height * 0.25;
    registerMarginTop = height * 0.25;
    this.$login.find("form").css('margin-top',loginMarginTop);
    this.$register.find("form").css('margin-top',registerMarginTop);
  },
  
  repositionContentbox : function(){
    position = $(".mp-map").position();
    height = position.top + (( $(".mp-map").height() - $(".mp-footer").height() - this.$container.height() ) * 0.5);
    width = ( $(".mp-map").width() - this.$container.width() ) * 0.5;
    this.$container.css('top',height).css('left',width);
  },
};
