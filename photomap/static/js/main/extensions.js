var arrayExtension = {
	firstUndef : function(array){
	    index = -1;
	    for (i = 0; i<= array.length;i++){
		if (array[i] == null){
		    return i;
		}
	    }
	    return -1;
	},
};

var mpEvents = {
  'trigger' : function(element, event){
    jQuery(element).trigger(event);
  },
  'toggleExpose': jQuery.Event("toggleExpose"),
  'iframeClose': jQuery.Event("iframe_close"),
};
