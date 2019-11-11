"use strict"

define(["dojo/domReady!"],
  function () {
    function addFileValidationMethod (name, validateFn, message) {
      // eslint-disable-next-line no-unused-vars
      $.validator.addMethod(name, function (value, element, param) {
        if ($(element).attr("type") === "file") {
          return validateFn(element.files)
        } else {
          return true
        }
      }, message)
    }

    addFileValidationMethod("$photoValidationSingleFile", function (files) {
      return files.length === 1
    }, gettext("TOO_MANY_PHOTOS"))

    addFileValidationMethod("$photoValidationSupportedFileType", function (files) {
      var file = files[0]
      if (file) {
        return file.type && $.inArray(file.type.toLowerCase(), ["image/jpeg", "image/png"]) > -1
      } else {
        return true
      }
    }, gettext("EXTENSION_NOT_SUPPORTED"))

    addFileValidationMethod("$photoValidationSupportedFileSize", function (files) {
      var file = files[0]
      if (file) {
        return file.size < 3e+6
      } else {
        return true
      }
    }, gettext("LARGE_PHOTO_ERROR"))

    $.validator.addClassRules({
      $photoValidation: {
        $photoValidationSingleFile: true,
        $photoValidationSupportedFileSize: true,
        $photoValidationSupportedFileType: true
      }
    })

    return {
      // eslint-disable-next-line no-unused-vars
      load: function (id, require, callback) {
        callback()
      }
    }
  })
