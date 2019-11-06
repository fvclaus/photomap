"use strict"

define(["dojo/_base/declare"],
  function (declare) {
    return declare(null, {
      constructor: function () {
      },
      mockSuccessfulInsertResponse: function (newData, expectedUrl) {
        this._mock(expectedUrl, newData, function (options, jqXHR) {
          var data = $.extend({}, newData)
          data.success = true
          data.id = 1
          options.success.call(null, data, "200", jqXHR)
        })
      },
      mockSuccessfulUpdateResponse: function (newData, expectedUrl) {
        this._mock(expectedUrl, newData, function (options, jqXHR) {
          options.success.call(null, {
            success: true
          }, "200", jqXHR)
        })
      },
      mockSuccessfulDeleteResponse: function (expectedUrl) {
        this._mock(expectedUrl, {}, function (options, jqXHR) {
          options.success.call(null, {
            success: true
          }, "200", jqXHR)
        })
      },
      mockFailureResponse: function (newData, expectedUrl) {
        this._mock(expectedUrl, newData, function (options, jqXHR) {
          options.success.call(null, {
            success: false,
            error: "Something went wrong"
          }, "200", jqXHR)
        })
      },
      mockErrorResponse: function (newData, expectedUrl) {
        this._mock(expectedUrl, newData, function (options, jqXHR) {
          options.error.call(null, jqXHR, "500", "Something went wrong.")
        })
      },
      _mock: function (expectedUrl, expectedData, eventHandlerCb) {
        var isActive = true
        var instance = this

        $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
          // It is not possible to unregister ajax prefilters.
          // When running more than one test, it will be executed every time.
          if (!isActive) {
            return
          }
          isActive = false

          jqXHR.abort()

          instance._expectCorrectAjaxConfiguration(expectedUrl, expectedData, originalOptions)
          eventHandlerCb(options, jqXHR)
        })
      },
      _expectCorrectAjaxConfiguration: function (expectedUrl, expectedData, options) {
        expect(options.url).toBe(expectedUrl)

        if (expectedData.isPhotoUpload) {
          expect(!options.processData).toBeFalsy()
          expect(!options.cache).toBeFalsy()
          expect(options.data).toBeInstanceOf(FormData)
          // This is a controlling directive and not model data.
          delete expectedData.isPhotoUpload
        } else if (options.data) {
          for (var attribute in expectedData) {
            if (Object.prototype.hasOwnProperty.call(expectedData, attribute)) {
              expect(options.data[attribute]).toBeDefined()
            }
          }
        }
      }
    })
  })
