$.tools.validator.fn("[type=file]",function(el,value){
    return /\.(jpg|png)$/i.test(value) ? true : "only jpg or png allowed";
});

$(document).ready(function(){
    clientServer = main.getClientServer();
    controls = main.getUI().getControls();
    
    // check input file and save it in case it is valid (*.jpeg||*.png)
    if ( $("input#file-input") ) {
	$("#file-input").bind('change',controls.handleFileInput);
    }
    $('.mp-single-upload').bind('click',function(){
	clientServer.handleUpload(false);
    });
    $('.mp-multiple-upload').bind('click',function(){
	clientServer.handleUpload(true);
    });
});
