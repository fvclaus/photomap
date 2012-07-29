UIPanel = function (){

    this.$topPanel = $('.mp-top-panel');
    this.$bottomPanel = $('.mp-bottom-panel');
    this.$footer = $("#mp-footer");
    this.$header = $("#mp-header");
    this.$title = this.$header.find(".mp-page-title");
};

UIPanel.prototype = {
    
    init : function(){
	this.resizeFooterFont();
	this.resizePageTitle();
    },
	
    getFooterHeight : function(){
	return this.$footer.height();
    },
    
    resizeFooterFont : function(){
	text = this.$footer.text();
	width = this.$footer.width();
	height = this.$footer.height();
	tools = main.getUI().getTools();
	size = tools.calculateFontSize(text,width,height);
	this.$footer.css("fontSize",size + "px");
    },
    
    resizePageTitle : function(){
	text = this.$title.text();
	width = this.$title.width() * 0.7;
	height = this.$title.height() * 0.7;
	tools = main.getUI().getTools();
	size = tools.calculateFontSize(text,width,height);
	this.$title.css("fontSize",size + "px");
    },

    getHeight : function(){
	tools = main.getUI().getTools();
	return tools.getRealHeight(this.$header);
    }

};
