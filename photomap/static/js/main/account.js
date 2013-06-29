/*jslint */
/*global $, document, gettext */

"use strict";

/**
 * evaluates form, submits it via ajax (type = post) and displays results (error messages depend on what failed)
 * @param {jQuery} $form Selector
 * @param {Function} onSuccess handler to be called if the request was succesful
 * @param {Function} onFail handler to be called if request failed 
 */
function submitForm ($form, onSuccess, onFail) {
   var formData = {}, 
      $requestFail = $form.find(".mp-request-fail"),
      $submitFail = $form.find(".mp-submit-fail"),
      $success = $form.find(".mp-request-success");
            
   $.each($form.serializeArray(), function(i, field) {
      formData[field.name] = field.value;
   });
     
   $.ajax({
      url: $form.attr("action"),
      type: "POST",
      data: formData,
      success: function (data) {
         $submitFail.empty();
         $success.hide();
         //empty all input fields - if you want a value to stay you have to define that in onSuccess/Fail and return the value from server
         $form.find("input").not("input[type='hidden']").not("input[type='submit']").each(function (i, field) {
            console.log(field);
            $(field).val("");
         });
         
         if (data) {
            console.log(data);
            if (data.success) {
               $success.show()
               if (onSuccess) {
                 onSuccess.call(null, data);
               }
            } else {
               $requestFail.text(data.error);
               if (onFail) {
                  onFail.call(null, data);
               }
            }
            
         } else {
            $requestFail.text(gettext("REQUEST_UNKNOWN_FAIL"));
         }
      },
      error: function (jqXHR, textStatus, errorThrown) {
         $success.hide();
         $requestFail.empty();
         $submitFail.text(textStatus + ": " + errorThrown);
      }
   });
}

function showCorrectMessage () {
   
   var messages = {
      cause_testing: gettext("CAUSE_TESTING_LABEL"),
      cause_alternative: gettext("CAUSE_ALTERNATIVE_LABEL"),
      cause_service: gettext("CAUSE_SERVICE_LABEL"),
      cause_usage: gettext("CAUSE_USAGE_LABEL"),
      cause_limitations: gettext("CAUSE_LIMITATIONS_LABEL"),
      cause_need: gettext("CAUSE_NEED_LABEL"),
      cause_like: gettext("CAUSE_LIKE_LABEL"),
      
   }
   
   $("input[type='radio']").on("click", function (event) {
      $("#cause-label").text(messages[$(this).attr("id")]);
   });
}

$(document).ready(function () {
   var spaceUsage = [];
   // show correct space usage in MB
   spaceUsage.push(parseFloat($("#mp-user-quota").text()));
   spaceUsage.push(parseFloat($("#mp-user-used-space").text()));
   spaceUsage.push(spaceUsage[0] - spaceUsage[1]);
   $.each(spaceUsage, function (index, spaceInBytes) {
      spaceUsage[index] = (spaceInBytes / Math.pow(2, 20)).toFixed(2).toString()
   });
   $("#mp-user-quota").text(spaceUsage[0]);
   $("#mp-user-used-space").text(spaceUsage[1]);
   $("#mp-user-free-space").text(spaceUsage[2]);
   
   // show correct update-form on demand
   $("#mp-account-settings-options a").on("click", function (event) {
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
   //submit the current form
   $(".mp-settings-form-submit").on("click", function (event) {
      event.preventDefault();
      var formData = {},
         $form = $(this).parents("form"),
         onSuccess = null;
         
      if ($form.parent().hasClass("mp-current-form") && $form.valid()) {
         
         if ($form.parent().attr("id") === "mp-update-email-form") {
            onSuccess = function (data) {
               $(".mp-user-email").text(data.email);
            }
         } else if ($form.parent().attr("id") === "mp-delete-account-form") {
            if (confirm(gettext("DELETE_ACCOUNT_CONFIRM"))) {
               submitForm($form);
            }
            return;
         }
         submitForm($form, onSuccess)
         
      }
   });
});
