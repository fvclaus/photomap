$.tools.validator.fn("[type=file]",function(el,value){
    return /\.(jpg|png)$/i.test(value) ? true : "only jpg or png allowed";
});

$(document).ready(function(){
	var event = main.getUIState().getDropEvent();
	console.log(event);
	$('.mp-single-upload').bind('click',function(){
	    $("#mp-filedrop").trigger('drop',event);
	});
	$('.mp-multiple-upload').bind('click',function(){
	    state.setMultipleUpload(true);
	    $("#mp-filedrop").trigger('drop',event);
	});
});
