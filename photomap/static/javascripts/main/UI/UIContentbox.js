UIContentbox = function(){
  
  this.$container = $("div.mp-content-container");
  this.$login = this.$container.find("#mp-login");
  this.$register = this.$container.find("#mp-register");
};

UIContentbox.prototype = {
  
  init : function(){
    this.repositionLoginRegistrationForms();
    this.repositionContentbox();
  },
  
  repositionLoginRegistrationForms : function(){
    height = this.$container.height();
    loginMarginTop = ( height - this.$login.height() ) * 0.5;
    registerMarginTop = ( height - this.$register.height() ) * 0.5;
    this.$login.css('margin-top',loginMarginTop);
    this.$register.css('margin-top',registerMarginTop);
  },
  
  repositionContentbox : function(){
    position = $(".mp-map").position();
    height = position.top + (( $(".mp-map").height() - $(".mp-footer").height() - this.$container.height() ) * 0.5);
    width = ( $(".mp-map").width() - this.$container.width() ) * 0.5;
    this.$container.css('top',height).css('left',width);
  },
};
