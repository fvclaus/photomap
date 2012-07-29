var arrayExtension = {
	firstUndef: function(array){
	    index = -1;
	    for (i = 0; i<= array.length;i++){
		if (array[i] == null){
		    return i;
		}
	    }
	    return -1;
	}
};
