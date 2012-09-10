var repeat, form, api, data;

$.tools.validator.fn("[type=file]",function(el,value){
    return /\.(jpg|png)$/i.test(value) ? true : "only jpg or png allowed";
});

// switches between multiple upload of photos and single upload depending on clicked button
function uploadSwitcher(){
    $form = $("form.mp-dialog");
    // prevent the usual browser form submission
    $form.submit(function(){
	return false;
    });
    // bind new submission rule
    $(".mp-button").bind('click',function(){
	
	// change depending on button
	if ($(this).attr('class').search('multiple') != -1){
	    repeat = true;
	}
	else {
	    repeat = false;
	}
	data = $form.serialize();
	data = data + "?repeat=" + repeat;
	console.log(data);
	//register form validator and grep api
	api = $form.validator().data("validator");
	api.onSuccess(function(e,els){
	    //submit form with ajax call and close popup
	    $.ajax({
		type : $form.attr("method"),
		url  : $form.attr("action"),
		'data' : data,
		dataType : "json",
		success : function(data,textStatus){
		    if (data.error){
			alert(data.error.toString());
			return;
		    }
		    instance._onAjax(data);
		    instance._close();
		},
		error : function(error){
		    instance._close();
		    alert(error.toString());
		}
	    }); 
	});
    });
};

$(document).ready(function(){
    $("input[name=photo-album]").val($("p.mp-invisible").html());
    $(".jquery-validator").validator();

});
