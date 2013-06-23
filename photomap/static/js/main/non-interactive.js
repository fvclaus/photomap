/*jslint */
/*global $, document */

/**
 * @description Provides common setup for all non-interactive pages.
 * Currently this involves adding validators styling buttons, decrypting email addresses.
 * It also includes site-specifc setup.
 */

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
/**
 * @description Js-modulo does not work if the first number is negative (eg. -5%4 = -1 | instead of 3)
 * You can fix that bug by adding the second number and do a modulo calculation again.
 * It also includes non common scripts. These should be kept short.
 */
//TODO I really don't know why this was in UITools. This function is used only once and only here.
function modulo (x, y) {
   return ((x % y) + y) % y;
}

/**
 * @description Decodes the field and updates the text in it.
 * @param {jQuery} $email Element holding the encoded text
 */
function decodeEmail ($email) {
   if ($email.size() !== 0) {
      
      var email = $email.text(),
          i = 0,
          emailDecoded = "";

      for (i = 0; i <= email.length; i++) {
         
         if (modulo(i, 5) === 0) {
            emailDecoded += email.charAt(i - 1);
         }
      }
      $email
         .text(emailDecoded)
         .removeClass("mp-nodisplay");
   }
}

// adds a validator and button styling to all forms
function startFormValidator () {
   $(".mp-form")
      .find(".mp-form-submit")
      .button({ icons : { primary : "ui-icon-play" } })
      .end()
      .validate({
         success : "valid",
         errorPlacement : function () {} //don't show any errors
      });
}

// there is no need to use initialize here. initialize just bloats the whole application and starts later
$(document).ready(function () {

   var hash = window.location.hash.substring(1,window.location.hash.length),
      spaceUsage = [];
   
   startFormValidator();
   // single point of control. we don't want to spread selectors throught the code
   decodeEmail($("#mp-email-jsenabled"));
   
   if ($("body").attr("id") === "help") {
      $("#help-navigation a").on("click", function (event) {
         event.preventDefault();
         var $link = $(this);
         
         if (!$link.hasClass("mp-active-link")) {
            $(".mp-active-link").removeClass("mp-active-link");
            $link.addClass("mp-active-link");
            $(".mp-active-section").fadeOut(200, function () {
               $(".mp-active-section").removeClass("mp-active-section");
               $($link.attr("href")).addClass("mp-active-section").fadeIn(200);
            });
         }
      });
      
      $(".mp-tutorial-tabs-wrapper").tabs({
         heightStyle: "filled"
      });
      
      $("#mp-tutorial").hide();
      if (hash) {
         $("#help-navigation").find("a[name='" + hash + "']").click();
      }
   }
   
   if ($("body").attr("id") === "account") {
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
         
         var $formWrapper = $($(this).attr("href"));
         
         if ($(".mp-current-form").length > 0) {
            if ($(".mp-current-form").attr("id") !== $(this).attr("href").substring(1, $(this).attr("href").length)) {
               $(".mp-current-form").fadeOut(300, function () {
                  $formWrapper
                     .fadeIn(300)
                     .addClass("mp-current-form");
                  $(this).removeClass("mp-current-form");
               });
            }
         } else {
            $formWrapper
               .fadeIn(300)
               .addClass("mp-current-form");
         }
      });
      //submit the current form
      $(".mp-form-submit").on("click", function (event) {
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
               onSuccess = function (data) {
                  alert(gettext("DELETE_ACCOUNT_SUCCESS"));
                  window.location.href = "/";
               }
               if (confirm(gettext("DELETE_ACCOUNT_CONFIRM"))) {
                  submitForm($form, onSuccess);
               }
               return;
            }
            submitForm($form, onSuccess)
            
         }
      });
   }
   // display all tags that are marked as buttons as ui-buttons
   $(".mp-button").button();
});

