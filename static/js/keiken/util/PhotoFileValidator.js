"use strict"

define([
  "dojo/_base/declare",
  "dojo/domReady!"],
function (declare) {
  function addFileValidationMethod (name, validateFn, message) {
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

  return declare(null, {
    constructor: function () {
      this.$warningTemplate = $("<div class='ui-state-highlight ui-corner-all' id='mp-photo-file-validator-warning'><p><span class='ui-icon ui-icon-alert mp-inline-block'></span><strong></strong></p></div>")
      this.$errorTemplate = $("<div class='ui-state-error ui-corner-all' id='mp-photo-file-validator-error'><p><span class='ui-icon ui-icon-alert mp-inline-block'></span><strong></strong></p></div>")
    },
    validate: function ($input, event) {
      this._removeMessages($input)
      var $error = this._checkFilesForErrors(event.target.files)
      var photo = null
      var $warning = null
      if ($error === null) {
        photo = event.target.files[0]
        this._photo = photo
        $warning = this._checkPhotoForWarnings(photo)
        if ($warning !== null) {
          $input
            .after($warning)
        }
      } else {
        $input
          .val(null)
          .after($error)
      }
    },
    getFile: function () {
      assertTrue(this._photo, "Must validate() before call to getFile().")
      return this._photo
    },
    _checkFilesForErrors: function (files) {
      var error = null
      if (files.length !== 1) {
        error = gettext("TOO_MANY_PHOTOS")
      } else if (files[0].type && $.inArray(files[0].type.toLowerCase(), ["image/jpeg", "image/png"])) {
        error = gettext("EXTENSION_NOT_SUPPORTED")
      }
      if (error !== null) {
        return this._generateError(error)
      }
      return null
    },
    _generateError: function (error) {
      var $error = this.$errorTemplate
        .clone()
        .find("strong")
        .text(error)
        .end()
      return $error
    },
    _checkPhotoForWarnings: function (photo) {
      if (photo.size > Math.pow(2, 20)) {
        return this._generateWarning(gettext("LARGE_PHOTO_ERROR"))
      }
      return null
    },
    _generateWarning: function (warning) {
      var $warning = this.$warningTemplate
        .clone()
        .find("strong")
        .text(warning)
        .end()
      return $warning
    },
    _removeMessages: function ($input) {
      $input
        .parent()
        .find("#mp-photo-file-validator-error")
        .add("#mp-photo-file-validator-warning")
        .remove()
    }

  })
})
