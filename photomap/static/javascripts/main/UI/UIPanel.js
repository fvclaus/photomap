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
	this.resizeBottomPanelLinks(this.$bottomPanel);
	this.resizePageTitle(this.$title);
	this.repositionBottomPanel();
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
    
    resizePageTitle : function(titlebox){
	text = titlebox.text();
	width = titlebox.width() * 0.7;
	height = titlebox.height() * 0.7;
	size = this.tools.calculateFontSize(text,width,height);
	titlebox.css("fontSize",size + "px");
    },
    
    repositionBottomPanel : function(){
	var position = {'top': 17, 'left': 17,};
	console.log(position);
	position.top += $(".mp-container").height() - this.$footer.height();
	console.log(position);
	this.$footer.css('top',position.top).css('left',position.left);
    },
};
