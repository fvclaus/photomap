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
var helperFunctions = {
    getParameterByName : function (name){
      name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
      var regexS = "[\\?&]" + name + "=([^&#]*)";
      var regex = new RegExp(regexS);
      var results = regex.exec(window.location.search);
      if(results == null)
	return "";
      else
	return decodeURIComponent(results[1].replace(/\+/g, " "));
    },
};
