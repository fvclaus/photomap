UIPanel = function (){

    this.$userpanel = $('.mp-userpanel');
    this.$bottomPanel = $('.mp-footer');

};

UIPanel.prototype = {
	
    getControlsBarHeight : function(){
	return this.$userpanel.height();
    },
    
};
