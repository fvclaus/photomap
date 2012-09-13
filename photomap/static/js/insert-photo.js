var frame, repeat, form, api, data;

// switches between multiple upload of photos and single upload depending on clicked button
// doesn't work due to data upload but we can keep it in case we try it later with ajax and html5
function uploadSwitcher(){
    $form = frame.$("form.mp-dialog");
    // prevent the usual browser form submission
    $form.submit(function(){
	return false;
    });
    // bind new submission rule
    frame.$(".mp-button").bind('click',function(){
	
	// change depending on button
	if ($(this).attr('class').search('multiple') != -1){
	    repeat = true;
	}
	else {
	    repeat = false;
	}
	data = $form.serialize();
	//data = data + "&repeat=" + repeat;
	console.log(data);
	console.log($form.attr("method"));
	console.log($form.attr("action"));
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
			console.log(data.error);
			window.parent.jQuery.fancybox.close();
			return;
		    }
		},
		error : function(error){
		    console.log(error);
		    window.parent.jQuery.fancybox.close();
		    return;
		}
	    });
	});
	// validate form (onSuccess -> ajax call)
	api.checkValidity();
    });
};

$.tools.validator.fn("[type=file]",function(el,value){
    return /\.(jpg|png)$/i.test(value) ? true : "only jpg or png allowed";
});

$(window.parent.frames[0]).ready(function(){
	frame = window.parent.frames[0];
	console.log(frame);
	// enable validator
	frame.$("form").validator();
	// change repeat to true when pressing multiple-upload-button
	frame.$("input.mp-button.mp-multiple-upload").bind('mousedown',function(){
	    $(this).siblings("input[name='repeat']").val('true');
	});
	
});
