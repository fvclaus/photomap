UIContentbox = function(){
  
  this.$container = $("div.mp-content-container");
  this.$login = this.$container.find("#mp-login");
  this.$register = this.$container.find("#mp-register");
};

UIContentbox.prototype = {
  
  init : function(){
    this.repositionLoginRegistrationForms();
  },
  
  repositionLoginRegistrationForms : function(){
    height = this.$container.height();
    loginMarginTop = height - this.$login.height() * 0.5;
    registerMarginTop = height - this.$register.height() * 0.5;
    this.$login.css('margin-top',loginMarginTop);
    this.$register.css('margin-top',registerMarginTop);
  },
};
