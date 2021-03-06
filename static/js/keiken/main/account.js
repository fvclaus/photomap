/*jslint */
/*global $, document, gettext */

"use strict";

$(document).ready(function () {
   // show correct update-form on demand
   $("#mp-account-settings-options a").not("#delete-account-link").on("click", function (event) {
      event.preventDefault();

      var $formWrapper = $($(this).attr("href")),
         focus = function () {
            $formWrapper.find(".mp-form-submit").focus();
         };

      if ($(".mp-current-form").length > 0) {
         if ($(".mp-current-form").attr("id") !== $(this).attr("href").substring(1, $(this).attr("href").length)) {
            $(".mp-current-form").fadeOut(300, function () {
               $formWrapper
                  .fadeIn(300, focus)
                  .addClass("mp-current-form");
               $(this).removeClass("mp-current-form");
            });
         }
      } else {
         $formWrapper
            .fadeIn(300, focus)
            .addClass("mp-current-form");
      }
   });
   $(".mp-form").each(function () {
      // Reset validator settings attached by startFormValidator.
      // This is dangerous, because existing listeners are not removed.
      $.data(this, "validator", null);
      var $form = $(this);
      $form.validate({
         // debug : true,
         success : "valid",
         errorPlacement : function () {},
         submitHandler : function () {
            var $requestFail = $form.find(".mp-request-fail"),
                $submitFail = $form.find(".mp-submit-fail"),
                $success = $form.find(".mp-request-success");


            $.ajax({
               url: $form.attr("action"),
               type: $form.attr("method"),
               data: $form.serialize(),
               success: function (data) {
                  $submitFail.empty();
                  $success.hide();
                  //empty all input fields - if you want a value to stay you have to define that in onSuccess/Fail and return the value from server
                  $form.find("input").not("input[type='hidden']").not("input[type='submit']").each(function (i, field) {
                     // console.log(field);
                     $(field).val("");
                  });

                  if (data.success) {
                     $success.show();
                  } else {
                     $requestFail.html(data.error);
                  }
               },
               error: function (jqXHR, textStatus, errorThrown) {
                  $success.hide();
                  $requestFail.empty();
                  $submitFail.text(textStatus + ": " + errorThrown);
               }
            });
         }
      });
   });
});
