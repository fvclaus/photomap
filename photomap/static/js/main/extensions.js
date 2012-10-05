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

/**
* Emulate FormData for some browsers
* MIT License
* (c) 2010 François de Metz
*/
(function(w) {
    if (w.FormData)
        return;
    function FormData() {
        this.boundary = "--------FormData" + Math.random();
        this._fields = [];
    }
    FormData.prototype.append = function(key, value) {
        this._fields.push([key, value]);
    }
    FormData.prototype.toString = function() {
        var boundary = this.boundary;
        var body = "";
        this._fields.forEach(function(field) {
            body += "--" + boundary + "\r\n";
            // file upload
            if (field[1].name) {
                var file = field[1];
                body += "Content-Disposition: form-data; name=\""+ field[0] +"\"; filename=\""+ file.name +"\"\r\n";
                body += "Content-Type: "+ file.type +"\r\n\r\n";
                body += file.getAsBinary() + "\r\n";
            } else {
                body += "Content-Disposition: form-data; name=\""+ field[0] +"\";\r\n\r\n";
                body += field[1] + "\r\n";
            }
        });
        body += "--" + boundary +"--";
        return body;
    }
    w.FormData = FormData;
})(window);
