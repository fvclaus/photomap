/*global $, document, FileReader, atob, Pixastic, XMLHttpRequest, FormData, Blob, parseInt, Image */

"use strict";

// var $slider, img, name, reader, file, files, content, header, body, encoding, $img, canvas, $canvas, context, maxSize = 300, longest_side, resizeFactor, height, revert, request, data, $full, $preview, width, UIPhotoEditor, editor, $original, operation, instance, params, dataType, sintheta, costheta, rotation, oImage, angle, options, original, wasVisible;

var width, editor, name, files, file, request, data;
  

$(document).ready(function () {
   width = $("#file-input").width();
   $("#tabs").tabs().dialog({minWidth : 1000});
   
   editor = new UIPhotoEditor();
   
   console.log(width);
   $("#file-input").change(function () {
      name = $(this).val();
      files = document.getElementById("file-input").files;
      if (files.length === 0) {
         return;
      }
      file = files[0];
      editor.edit(file);
   });
   
   $("form").submit(function () {
      return false;
   });
   $("#submit").click(function () {
      request = new XMLHttpRequest();
      data = new FormData();
      data.append("place", $("input[name='place']").val());
      data.append("title", $("input[name='title']").val());
      data.append("description", $("input[name='description']").val());
      data.append("photo", editor.getAsFile());
      
      request.onreadystatechange = function (e) {
         if (request.readyState === 4) {
            console.dir(JSON.parse(request.response));
         }
      };
      request.open("post", "/insert-photo", true);
      request.send(data);
   });
});


