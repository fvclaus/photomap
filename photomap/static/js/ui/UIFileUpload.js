"use strict";

var UIFileUpload;

UIFileUpload = function () {

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

   
};

UIFileUpload.prototype = {

};