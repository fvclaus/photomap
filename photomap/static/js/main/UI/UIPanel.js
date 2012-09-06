UIPanel = function (){

    this.$topPanel = $('.mp-top-panel');
    this.$bottomPanel = $('.mp-bottom-panel');
    this.$footer = $("#mp-footer");
    this.$header = $("#mp-header");
    this.$title = this.$header.find(".mp-page-title h1");
};

UIPanel.prototype = {
    
    init : function(){
	this.resizeFooterFont();
    },
    getFooterHeight : function(){
	return this.$footer.height();
    },
    getHeaderOffset: function(){
	return this.$header.offset();
    },
    resizeFooterFont : function(){
	text = this.$footer.find(".mp-internal-links a").first().text();
	width = 5000;
	height = this.$footer.height();
	tools = main.getUI().getTools();
	size = tools.calculateFontSize(text,width,height);
	this.$footer.css("fontSize",size + "px");
    },
    getHeight : function(){
	tools = main.getUI().getTools();
	return tools.getRealHeight(this.$header);
    }

};
