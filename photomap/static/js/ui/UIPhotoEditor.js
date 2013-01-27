/*global $, document, FileReader,  Pixastic, parseInt, parseFloat, Image, ERRORS, ALLOWED_UPLOAD_FILE_TYPES */

"use strict";

var UIPhotoEditor, instance, $orig, $preview, longest_side, canvas, context, $canvas, operation, options, wasVisible, rotation, angle, costheta, sintheta, original, dataType, newImage, newOriginal, $slider, $input;

longest_side = 500;

UIPhotoEditor = function(){


   this.PREVIEW_SELECTOR = "#ui-editor-preview";
   this.ORIG_SELECTOR = "#ui-editor-original";

   this.isCanvas = false;

   this.reader = new FileReader();

   this._init();

};

UIPhotoEditor.prototype = {
   edit : function (event) {
      //fail if markup is not present
      if (!document.getElementById("ui-editor")){
         throw new Error("Markup for UIPhotoEditor is not present. Please use the right template.");
      }
      
      this._init();
      instance = this;
      $orig = $(this.ORIG_SELECTOR);
      $preview = $(this.PREVIEW_SELECTOR);

      this.file = this.checkFile(event);
      if (this.file === null){
         $("input[type='file']").val(null);
      }
         
      this.reader.readAsDataURL(this.file);
      this.reader.onload = function (evt) {
         $orig.load(function () {

            //scale canvas to right proportions. check longest_side
            // ($orig.width() >= $orig.height()) ? $preview.width(longest_side) : $preview.height(longest_side);
            
            $preview.load(function () {
               $("#ui-editor-placeholder").hide();
               $orig.hide();
               $preview.show();
               // $preview.css("max-height", $preview.height());
               instance.enable();
            });

            $preview.attr("src", evt.target.result);
         });
         $orig.attr("src", evt.target.result);
      };
   },

   /**
    @public
    @description Takes files and checks them for validity.
    */
   checkFile : function (event) {
      event.preventDefault();
      event.stopPropagation();

      var files = event.target.files;

      if (files.length > 1) {
         alert(ERRORS.TOO_MANY_PHOTOS);
         return null;
      } else if (!files[0].type || $.inArray(files[0].type, ALLOWED_UPLOAD_FILE_TYPES) < 0) {
         // return if the file type is not allowed
         alert(ERRORS.UNALLOWED_FILE_TYPE);
         return null;
      }

      return files[0];
   },
   getAsFile : function() {
      //no processing done. return file
      if (!instance.isCanvas){
         return this.file;
      }
      canvas = $(this.ORIG_SELECTOR).get(0);
      return canvas.mozGetAsFile("photo.jpg", "image/jpeg", 1.0);
   },
   /**
    @private
    */
   _init : function () {
      $(this.PREVIEW_SELECTOR).hide();
      $(this.ORIG_SELECTOR).hide();
      
      this.$rotate = $("#rotate");
      this.$revert = $("#revert");
      this.$operations = $(".photo-operation");
      
      this.bindListener();
      this.disable();
      this.isRotateDisabled = false;

      this.originals = {};
      this.angles = {};
   },

   bindListener : function () {
      instance = this;
      this.$operations.click(function () {
         instance.disable();
     
         if (!instance.isCanvas){
            instance.replaceWithCanvas($(instance.ORIG_SELECTOR));
            instance.replaceWithCanvas($(instance.PREVIEW_SELECTOR));
            instance.isCanvas = true;
         }
         
         operation = $(this).attr("name");
         //this is not a generic photo operation. it is either rotate or revert
         if (!operation){
            console.log(operation + " is not a generic operation.");
            instance.enable();
            return;
         }
         if (!instance.isRotateDisabled){
            //TODO the disabled here does not seem to work
            instance.$rotate
               .text("No rotation possible after pixel operation.")
               .attr("disabled", "disabled");

            console.log("added disabled");
            instance.isRotateDisabled = true;
         }
         instance.apply(instance.ORIG_SELECTOR, operation, this);
         instance.apply(instance.PREVIEW_SELECTOR, operation, this);

         instance.enable();
      });
      this.$revert.click(function () {
         instance.disable();
         //revert rotation
         instance.rotate($(instance.ORIG_SELECTOR), 0, true); 
         //revert pixel operation
         Pixastic.revert($(instance.ORIG_SELECTOR).get(0));
         $(instance.ORIG_SELECTOR).hide();
         $preview = $(instance.PREVIEW_SELECTOR);
         $preview.css("max-height", $preview.height());
         instance.rotate($(instance.PREVIEW_SELECTOR), 0, true);
         Pixastic.revert($(instance.PREVIEW_SELECTOR).get(0));
         //enable rotate button again
         if (instance.isRotateDisabled){
            instance.$rotate.removeAttr("disabled");
            console.log("removed disabled");
            instance.isRotateDisabled = false;
         }
         instance.enable();
      });
      this.$rotate.click(function () {
         instance.disable();
         instance.rotate($(instance.ORIG_SELECTOR));
         instance.rotate($(instance.PREVIEW_SELECTOR));
         instance.enable();
      });
      
      this.initSliders();
   },
   apply : function(selector, operation, target) {
      $canvas = $(selector);
      wasVisible = $canvas.is(":visible");
      
      $canvas.show();
      //operation takes additional parameters
      options  = instance.getOptions(target);
      //retrieve the cached original image (not rotated)
      original = this.originals[$canvas.attr("id")];
      //apply the operation
      Pixastic.process($canvas.get(0), operation, options);

      //update the original - Pixastic returns a new(!) canvas element. Use it to update the src
      //TODO: this is not working
      // newOriginal = this.copyImage(original);
      // original.src = Pixastic.process(newOriginal, operation,options).toDataURL(); 
      // this.originals[$canvas.attr("id")] = newOriginal;
      // original.src = $(selector).get(0).toDataURL();
      

      if (!wasVisible){
         $(selector).hide();
      }
   },
   copyImage : function (img){
      newImage = document.createElement("img");
      newImage.width = img.width;
      newImage.height = img.height;
      return newImage;
   },
   replaceWithCanvas : function($img) {
      wasVisible = $img.is(":visible");
      $canvas = $("<canvas></canvas>");
      
      //this is the unaltered img data with the original resolution
      original = new Image();
      original.src = $img.attr("src");
      original.width = $img.width();
      original.height = $img.height();

      this.originals[$img.attr("id")] = original;
      this.angles[$img.attr("id")] = 0;

      $canvas
         .attr("id", $img.attr("id"))
         .attr("class", $img.attr("class"))
      //this does not work if you use .width(). believe me.... i have tried
         .attr("width", $img.width())
      //this does also not work with .height()
         .attr("height", $img.height());

      

      context = $canvas.get(0).getContext("2d");
      context.save();
      context.translate(0, 0);
      //draw image starting in the upper left corner. scale down if using the preview canvas
      context.drawImage($img.get(0), 0, 0, original.width, original.height);//, 0, 0, $canvas.width(), $canvas.height());
      $img.replaceWith($canvas);      
      context.restore();

      if(!wasVisible){
         $canvas.hide();
      }


   },
      
   getOptions : function (el) {
      if (!el) {
         console.log("el in getOptions() is not supposed to be empty");
         return;
      }
      options = {};
      $(el).siblings().each(function () {
         if ($(this).attr("type") === "checkbox"){
            options[$(this).attr("name")] = $(this).is(":checked");
         }
         else if ($(this).attr("type") === "text"){
            dataType = $(this).attr("dataType");
            if(dataType === "float") {
               options[$(this).attr("name")] = parseFloat($(this).val());
            }
            else if (dataType === "int"){
               options[$(this).attr("name")] = parseInt($(this).val());
            }
         }
      });
      return options;
   },
   rotate : function ($canvas, angle, reset) {

      if (!reset){
         angle = (this.angles[$canvas.attr("id")] + 90) % 360;
      }

      this.angles[$canvas.attr("id")] = angle;
      rotation = Math.PI * angle / 180;
      
      costheta = Math.cos(rotation);
      sintheta = Math.sin(rotation);
      
      //again. don't use .width() or .height() on the canvas element
      original = this.originals[$canvas.attr("id")];
      $canvas
         .attr("width", Math.abs(costheta*original.width) + Math.abs(sintheta*original.height))
         .attr("height", Math.abs(costheta*original.height) + Math.abs(sintheta*original.width));
      
      context = $canvas.get(0).getContext("2d");
      if (rotation <= Math.PI/2) {
         context.translate(sintheta * original.height, 0);
      } else if (rotation <= Math.PI) {
         context.translate($canvas.width(), -costheta * original.height);
      } else if (rotation <= 1.5*Math.PI) {
         context.translate(-costheta * original.width, $canvas.height());
      } else {
         context.translate(0 ,-sintheta * original.width);
      }
      
      
      context.rotate(rotation);
      context.drawImage(original, 0, 0, original.width, original.height);

   },
   disable : function () {
      this.$operations.attr("disabled", "disabled");
   },
   enable : function () {
      this.$operations.removeAttr("disabled");
   },
   initSliders : function () {
      $(".slider").each(function () {
         $slider = $(this);
         $input = $slider.siblings("input");

         $slider.slider({
               slide : function (event, ui) {
                  $(this).siblings("input").val(ui.value);
               }
            });

         if ($input.attr("min")) {
            $slider.slider("option", "min", parseFloat($input.attr("min")));
         }
         if ($input.attr("max")) {
            $slider.slider("option", "max", parseFloat($input.attr("max")));
         }
         if ($input.attr("max") || $input.attr("min")){
            $slider.slider("option", "step", 0.1);
         }
         
      });
   }
};