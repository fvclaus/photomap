$(document).ready(function(){    
  $("#fancybox-overlay").css({
    'max-height': $('#mp-map').height(),
    'max-width': $('#mp-map').width(),
    'top': $('#mp-map').offset().top,
    'left': $('#mp-map').offset().left,
  });
  // doesn't work yet
  $("#fancybox-outer").css('borderRadius','15px');  
});
