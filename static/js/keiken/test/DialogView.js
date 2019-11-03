/* global define, $, QUnit, FormData */

"use strict"

define(["dojo/_base/declare",
  "../view/DialogView",
  "../util/ClientState"],
function (declare, DialogView, state) {
  var $testBody = $("#testBody")
  var $submit = null
  var dialog = null
  var $container = null
  var assertMessageIsVisible = function () {
    QUnit.ok($submit.button("option", "disabled"))
    QUnit.ok($("#mp-dialog-message").is(":visible"))
  }
  var selectAndTriggerSubmit = function () {
    $submit = $("#mp-dialog-button-save")
    $submit.trigger("click")
  }
  var setInputValues = function () {
    dialog.setInputValue("title", "Title")
    dialog.setInputValue("description", "Description")
  }

  module("DialogView", {
    setup: function () {
      $container = $("<div id='mp-dialog'></div>")
      $testBody.append($container)
    },
    teardown: function () {
      if ($("#mp-dialog") === 1) {
        dialog.close()
      }
      $(".ui-dialog").remove()
      $testBody.empty()
    }
  })

  QUnit.asyncTest("showWithSuccess", function () {
    state.setDialogAutoClose(false)
    dialog = new DialogView()
    dialog.show({
      load: function () {
        $submit = $("#mp-dialog-button-save")
        // Check that the form has been loaded
        QUnit.ok($("form").size() >= 1)
        dialog.setInputValue("title", "Title")
        QUnit.ok($("input[name='title']").val() === "Title")
        QUnit.raiseError(dialog.setInputValue, dialog, "doesNotExist")
        setTimeout(function () {
          dialog.setInputValue("description", "Description")
          $submit.trigger("click")
        }, 1000)
      },
      submit: function (data) {
        QUnit.ok($submit.button("option", "disabled"))
        QUnit.ok(data.title === "Title")
        QUnit.ok(data.description === "Description")
        dialog.showResponseMessage({ success: true })
      },
      success: function (response) {
        // Wait for the message to show
        setTimeout(function () {
          assertMessageIsVisible()
          QUnit.ok(response.success)
          $("input[name='auto-close']").trigger("click")
          QUnit.ok(state.getDialogAutoClose() === true)
          $("input[name='auto-close']").trigger("click")
          QUnit.ok(state.getDialogAutoClose() === false)
          QUnit.start()
        }, 2000)
      },
      url: "/form/update/model"
    })
  })

  QUnit.asyncTest("validator", function () {
    dialog = new DialogView()
    dialog.show({
      load: function () {
        selectAndTriggerSubmit()
        setTimeout(function () {
          QUnit.ok($submit.button("option", "disabled") === false)
          QUnit.start()
        }, 500)
      },
      submit: function () {
        // Form should not be submitted. It is not valid.
        QUnit.ok(false)
      },
      url: "/form/update/model"
    })
  })

  QUnit.asyncTest("showWithFailure", function () {
    state.setDialogAutoClose(false)
    dialog = new DialogView()
    dialog.show({
      load: function () {
        setInputValues()
        selectAndTriggerSubmit()
      },
      submit: function () {
        dialog.showResponseMessage({ success: false, error: "Something went wrong." })
        setTimeout(function () {
          assertMessageIsVisible()
          QUnit.start()
        }, 2000)
      },
      success: function () {
        // This should not be triggered.
        QUnit.ok(false)
      },
      url: "form/update/model"
    })
  })

  QUnit.asyncTest("autoClose", function () {
    state.setDialogAutoClose(true)
    dialog = new DialogView()
    dialog.show({
      load: function () {
        setInputValues()
        selectAndTriggerSubmit()
      },
      submit: function () {
        dialog.showResponseMessage({ success: true })
        setTimeout(function () {
          QUnit.ok($("#mp-dialog").size() === 0)
          QUnit.start()
        }, 1000)
      },
      url: "form/update/model"
    })
  })
})
