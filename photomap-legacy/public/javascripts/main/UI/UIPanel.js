UIPanel = function (){

    this.$wrapper = $('.mp-userpanel');
    this.$bottomPanel = $('.mp-footer');

};

UIPanel.prototype = {
	
    getControlsBarHeight : function(){
	return this.$wrapper.height();
    },
    
};
