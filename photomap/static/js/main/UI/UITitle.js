UITitle = function(){
    //title bar root

    this.$wrapper = $("div.mp-title-wrapper")
    this.$title = this.$wrapper.find("p.mp-label");
    
};

UITitle.prototype = {
    init : function(){
	this.$title
	    .css("font-size",
		 main.getUI().getTools().calculateFontSize(
		     this.$title.text(),
		     this.$wrapper.width(),
		     this.$wrapper.height()
		 )+"px")
	    .css(
		"left",
		(this.$wrapper.width() / 2 - this.$title.width()/2) + "px"
	    );
    },
};
