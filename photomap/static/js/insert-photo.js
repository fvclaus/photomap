$(document).ready(function(){
    $("input[name=photo-album]").val($("p.mp-invisible").html());
    $(".jquery-validator").validator();

});
$.tools.validator.fn("[type=file]",function(el,value){
    return /\.(jpg|png)$/i.test(value) ? true : "only jpg or png allowed";
});