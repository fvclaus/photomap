UIControls = function(maxHeight) {

    this.$controls = $('.mp-controls');
    this.$controls.height(maxHeight);
    
    //currently photo only
    this.$photoControls = $(".mp-photo-controls-wrapper");
    this.$photoControls.hide();
    this.$delete = $("img.mp-option-delete");
    this.$update = $("img.mp-option-modify");

    this.$logout = this.$controls.find(".mp-option-logout").show();
    this.$center = $(".mp-option-center");

    
    this.bindListener();

};

UIControls.prototype = {
    
    init : function(){
	this.placeCenterControl();
	this.bindListener();
    },
    
    // setPhotoControls : function(){
    // 	this.$add = $(".mp-option-add");
    // 	this.$delete = $(".mp-option-delete");
    // 	this.$modify = $(".mp-option-modify");
    // },

    hideControls : function(){
	// instance.$delete.hide();
	// instance.$update.hide()
	this.$insert.parent().hide();
	this.$center.hide();
    },

    showControls : function(){
	if(main.getClientState().isAdmin()){
    	    // this.$delete.show();
	    // this.$modify.show();
	    // this.$insert.parent().show();
	}
	this.$center.show();
    },
    
    placeCenterControl : function(){
	//reposition
	this.$center.show();
	position = $("#mp-map").position();
	position.top += $("#mp-header").height() * 0.5
	position.left += 5;
	this.$center.css({
	    'top' : position.top,
	    'left' : position.left
	})
	    .hide();
    },
    
    /*
      ich hab das mal mit css only gelöst
      das bild kann man ja noch auf einen größeren (gimp) hintergrund packen, dann wird das auch nicht so stark vergrößert.
    */
    plantAddControl : function(){
	// // bugfix for empty places
	// heightWrapper = $(".mp-album-wrapper").height() * 0.2; 
	// $(".mp-option-add-wrapper").css('height',heightWrapper)
	
	// // resize & reposition add control
	// height = this.$insert.parent().height() * 0.45;
	// marginTop = ( this.$insert.parent().height() - height ) * 0.5;
	// marginLeft = ( this.$insert.parent().width() - height ) * 0.5;
	// this.$insert.css('height',height).css('width',height).css('margin-top',marginTop).css('margin-left',marginLeft);
    },
    
    /*
      ansatz mit jedes mal neuerstellen ist zu ineffizient
      die listener werden auch jedes mal neugebunden
      variablen die jquery elemente halten sollten immer mit $ starten
      also lieber $el anstatt element
    */
    showPhotoControls : function($el){
	
	// $(".mp-gallery").append($.jqote( '#photoControlsTmpl', {} ));
	// wofür ist das +4 und -1?
	offset = $el.offset();
	
	this.showModifyControls($el.offset(),$el.width(),$el.height());
	// offset = $el.offset();
	// offset.top += $el.height() + 4;
	// offset.left += 1;

	// console.log(position);
	// size = {
	//     x: $el.width() + 4,
	//     y: $el.height() * 0.2,
	// };
	// console.log(size);
	
	// // höhe und breite muss man nur einmal setzten
	// this.$photoControls
	//     .width(size.x)
	//     .height(size.y)
	//     .offset(offset)
	//     .show()
	//     .find(".mp-photo-controls")
	//     .height(this.$photoControls.height() * 0.7)
	//     .width(this.$photoControls.width() * 0.15);
	
	// add inserted controls to "controls"-class and set bindListener to enable controls
	// this.setPhotoControls();
	// this.bindListener();
    },

    showModifyControls : function(offset,width,height){
	// $(".mp-gallery").append($.jqote( '#photoControlsTmpl', {} ));
	// wofür ist das +4 und -1?

	// offset.top += height + 4;
	// offset.left += 1;

	console.log(position);
	size = {
	    x: width + 4,
	    y: height * 0.2,
	};
	console.log(size);
	
	// höhe und breite muss man nur einmal setzten
	this.$photoControls
	    // .width(size.x)
	    // .height(size.y)
	    .offset(offset)
	    .css("z-index",999999)
	    .show("show")
	    .find(".mp-photo-controls")
	    .height(this.$photoControls.height() * 0.8)
	    .width(this.$photoControls.width() * 0.45);
	
	// add inserted controls to "controls"-class and set bindListener to enable controls
	// this.setPhotoControls();
	// this.bindListener();
    },

    
    hidePhotoControls : function(){
	
	// $(".mp-photo-controls-wrapper").detach();
	this.$photoControls.hide();
	
    },

    bindInsertPhotoListener : function(){

	this.$insert = $(".mp-option-add");
	//commit in iframe because of img upload
	this.$insert
	    .remove("click.PhotoMap")
	    .bind("click.PhotoMap",function(event){
	    place = main.getUIState().getCurrentPlace();
	    // reset load function 
	    main.getUI().getInput().iFrame("/insert-photo?place="+place.id);
	});
    },

    bindListener : function(){

	var instance = this;
	this.$delete.bind("click.MapPhotoAlbum",function(event){
	    // hide current place's markers and clean photos from gallery
	    state = main.getUIState();	
	    photo = state.getCurrentPhoto();
	    place = state.getCurrentPlace();
	    var url,data;
	    
	    // delete current photo
	    if ($(this).hasClass("mp-element-photo")) {
		if(confirm("Do you really want to delete photo "+photo.name)){
		    url = "/delete-photo",
		    data = {"id":photo.id};
		    //deletes photo from gallery and moves or hides slider
		    main.getUI().getTools().deletePhoto(photo);
		}
		else 
		    return;
	    }

	    // delete current place
	    else if ($(this).hasClass("mp-element-place")){
		if(confirm("Do you really want to delete place "+place.name)){
		    url = "/delete-place";
		    data = {"id":place.id};
		    place._delete();
		    main.getUI().getInformation().setInfo();
		}
		else
		    return;
	    }
	    else { alert("hasnoClass")}
	    
	    //call to delete marker or photo in backend
	    $.ajax({
		type : "post",
		dataType : "json",
		"url" : url,
		"data" : data,
		success : function(data){
		    if (data.error){
			alert(data.error);
		    }
		},
		error : function(err){
		    alert(err.toString());
		}
	    });
	});

	this.$update.bind("click.MapPhotoAlbum",function(event){
	    var state = main.getUIState();	
	    var place = state.getCurrentPlace();
	    var photo = state.getCurrentPhoto();
	    
	    // edit current photo
	    if ($(this).hasClass("mp-element-photo")) {

		main.getUI().getInput()
		    .onLoad(function(){
			//prefill with values from selected picture
			$("input[name=id]").val(photo.id);
			$("input[name=order]").val(photo.order);
			var $name = $("input[name=title]").val(photo.name);
			var $desc = $("textarea[name=description]").val(photo.desc);

			//reflect changes locally when form is valid and ready to be send
			main.getUI().getInput().onForm(function(){
			    photo.name = $name.val();
			    photo.desc = $desc.val();
			    main.getUI().getInformation().setInfo({
				name : $name.val(),
				desc : $desc.val()
			    });
			})
		    })
		    .get("/update-photo");
	    }

	    //edit current place
	    else if ($(this).hasClass("mp-element-photo")){
		//prefill with name and update on submit

		main.getUI().getInput()
		    .onLoad(function(){
			$("input[name=id]").val(place.id);
			var $name = $("input[name=title]").val(place.name);
			var $desc = $("textarea[name=description]").val(place.desc);

			main.getUI().getInput().onForm(function(){
			    //reflect changes locally
			    place.name = $name.val();
			    place.desc = $desc.val();
			    main.getUI().getInformation().setInfo(place);
			})
		    })
		    .get("/update-place");
	    }
	});
	

	
	this.$center.bind("click.MapPhotoAlbum",function(event){
	    var place = main.getUIState().getCurrentPlace();
	    if (place){
		place.center();
	    }
	});
    },

    

};
