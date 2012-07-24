UIPanel = function (){

    this.tools = new UITools();

    this.$topPanel = $('.mp-top-panel');
    this.$bottomPanel = $('.mp-bottom-panel');
    this.$footer = $("#mp-footer");
    this.$header = $("#mp-header");
    this.$title = this.$header.find(".mp-page-title");
};

UIPanel.prototype = {
    
    init : function(){
	this.resizeFooterFont(this.$footer);
	this.resizePageTitle(this.$title);
    },
	
    getFooterHeight : function(){
	return this.$footer.height();
    },
    
    resizeFooterFont : function(footer){
	    text = footer.text();
	    width = footer.width();
	    height = footer.height();
	    size = this.tools.calculateFontSize(text,width,height);
	    footer.css("fontSize",size + "px");
    },
    
    resizePageTitle : function(titlebox){
	text = titlebox.text();
	width = titlebox.width() * 0.7;
	height = titlebox.height() * 0.7;
	size = this.tools.calculateFontSize(text,width,height);
	titlebox.css("fontSize",size + "px");
    },

};
