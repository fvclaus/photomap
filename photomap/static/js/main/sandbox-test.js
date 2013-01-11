/*global $, document, FileReader, atob, Pixastic */



"use strict";


var $canvas, context, $img, oImage;

$(document).ready(function () {
   
   $img = $("#image").load(function () {

      replaceWithCanvas($img);
   });

   // $("#sepia").click(function () {
   //    Pixastic.process($canvas.get(0), "sepia");
   // });
   // $("#revert").click(function () {
   //    // context = canvas.getContext('2d');
   //    Pixastic.revert($("canvas.preview").get(0));
   // });
   
});

function replaceWithCanvas ($img) {
   $canvas = $("<canvas></canvas>");
   oImage = new Image();
   oImage.src = $img.attr("src");
   $canvas.get(0).src = oImage.src;

   $canvas
      .data("original", $img.get(0))
      .attr("id", $img.attr("id"))
      .attr("class", $img.attr("class"))
      .attr("width", $img.width())
      .attr("height", $img.height());
   
   $canvas.insertAfter($img);
   context = $canvas.get(0).getContext("2d");
   context.save();
   context.translate(0, 0);
   context.drawImage(oImage, 0, 0, oImage.width, oImage.height, 0 , 0, $canvas.width(), $canvas.height());
   context.restore();
   
}

