"use strict"

define(["dojo/_base/declare"],
  function (declare) {
    return declare(null, {
      _sendRequest: function (ajaxConfig, successFn, errorFn) {
        $.ajax($.extend({}, {
          dataType: "json",
          success: function (data) {
            if (data.success) {
              successFn(data)
            } else {
              errorFn(data)
            }
          },
          error: function () {
            errorFn({
              error: gettext("NETWORK_ERROR"),
              success: false
            })
          }
        }, ajaxConfig))
      }
    })
  })
