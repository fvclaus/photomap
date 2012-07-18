UIPanel = function (){

    this.tools = new UITools();

    this.$topPanel = $('.mp-top-panel');
    this.$bottomPanel = $('.mp-bottom-panel');
    this.$footer = $("#mp-footer");
};

UIPanel.prototype = {
    
    init : function(){
	this.repositionBottomPanel();
	this.resizeBottomPanelLinks(this.$bottomPanel)
    },
	
    getControlsBarHeight : function(){
	return this.$topPanel.height();
    },
    
    resizeBottomPanelLinks : function(bottomPanel){
	    text = bottomPanel.text();
	    width = bottomPanel.width();
	    height = bottomPanel.height();
	    size = this.tools.calculateFontSize(text,width,height);
	    bottomPanel.css("fontSize",size + "px");
    },
    
    repositionBottomPanel : function(){
	var position = this.$topPanel.position();
	position.top += $(".mp-container").height() - this.$footer.height();
	this.$footer.css('top',position.top).css('left',position.left);
    },
};
