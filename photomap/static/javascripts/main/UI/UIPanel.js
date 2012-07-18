UIPanel = function (){

    this.tools = new UITools();

    this.$topPanel = $('.mp-top-panel');
    this.$bottomPanel = this.resizeBottomPanelLinks($('.mp-bottom-panel'));
};

UIPanel.prototype = {
	
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
};
