/*jslint */
/*global $, document, navigator */

"use strict";

/**
 * @author Marc Römer 
 * @description add here general settings (like ajax settings) that are used on all pages 
 */

/**
 * @param {Object} method check whether crsf protection is needed or not
 */
function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

$.ajaxSetup({
    crossDomain: false, // obviates need for sameOrigin test
    beforeSend: function(xhr, settings) {
        var csrftoken = $.cookie("csrftoken");
        if (!csrfSafeMethod(settings.type)) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});

function areCookiesEnabled() {
    var cookieEnabled = (navigator.cookieEnabled) ? true : false;

    if (typeof navigator.cookieEnabled === "undefined" && !cookieEnabled) { 
        $.cookie("testcookie", "test");
        cookieEnabled = ($.cookie("testcookie")) ? true : false;
        $.cookie("testcookie", null);
    }
    return (cookieEnabled);
}

$(document).ready(function () {
   if (!areCookiesEnabled()) {
      $("#mp-no-cookies").show();
   } else {
      $("#mp-no-cookies").hide();
   }
});
