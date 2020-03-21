"use strict"

$(document).ready(function () {
  console.log("This is the dashboard.")
  $(".mp-full-column-controls").height($(".mp-column-closer").height() + 5 + "px")
  $("#mp-page-title").css("cursor", "help")
})
