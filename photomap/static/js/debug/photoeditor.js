/*global $, document, FileReader, UIPhotoEditor, Pixastic, XMLHttpRequest, FormData, Blob, parseInt, Image */

"use strict";


var width, editor, name, files, file, request, data;
  

$(document).ready(function () {
   width = $("#file-input").width();
   $("#tabs").tabs().dialog({minWidth : 1000, title : "add a new photo"});
   
   editor = new UIPhotoEditor();
   
   console.log(width);
   $("#file-input").change(function (event) {
      // name = $(this).val();
      // files = document.getElementById("file-input").files;
      // if (files.length === 0) {
      //    return;
      // }
      // file = files[0];
      editor.edit(event);
   });
   
   $("form").validate({
      success : "valid",
      submitHandler : function(form){
         alert("the form seems valid now");
         request = new XMLHttpRequest();
         data = new FormData();
         data.append("place", $("input[name='place']").val());
         data.append("title", $("input[name='title']").val());
         data.append("description", $("input[name='description']").val());
         data.append("photo", editor.getAsFile());

         $.ajax({
            data : data,
            type : "post",
            processData : false,
            contentType : false,
            cache : false,
            url : "/insert-photo",
            success : function(data){
               console.dir(data);
            },
         });
            
         
         // request.onreadystatechange = function (e) {
         //    if (request.readyState === 4) {
         //       console.dir(JSON.parse(request.response));
         //    }
         // };
         // request.open("post", "/insert-photo", true);
         // request.send(data);
      }
   });
});


