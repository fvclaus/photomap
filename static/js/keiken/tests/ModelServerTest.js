"use strict"

define(["dojo/_base/declare"],
  function (declare) {
    return declare(null, {
      constructor: function () {
        this._expectedUrl = null
        this._expectedData = null
        this._isActive = false
        this._isRegisterd = false
      },
      register: function (model) {
        assertFalse(this._isRegistered, "You cannot re-register the same object twice.")
        assertFalse(this._isActive, "You cannot not register the same object twice")
        this._isRegistred = true
        this._isActive = true

        var instance = this
        var attribute = null
        var data = null
        var onUpdateAndInsert = null

        $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
          // It is not possible to unregister ajax prefilters.
          // When running more than one test, it will be executed every time.
          if (!instance._isActive) {
            return
          }

          expect(originalOptions.url).toBe(instance._expectedUrl)
          if (instance._expectedData.isPhotoUpload) {
            expect(!originalOptions.processData).toBeFalsy()
            expect(!originalOptions.cache).toBeFalsy()
            expect(originalOptions.data).toBeInstanceOf(FormData)
            // This is a controlling directive and not model data.
            delete instance._expectedData.isPhotoUpload
          } else {
            for (attribute in instance._expectedData) {
              if (instance._expectedData.hasOwnProperty(attribute)) {
                expect(originalOptions.data[attribute]).toBeDefined()
              }
            }
          }
          jqXHR.abort()

          model.onSuccess(function (data, status, xhr) {
            expect(status).toBe("200")
            expect(xhr).toBe(jqXHR)
          })

          // Simulate different response scenarios.
          // SUCCESS
          data = $.extend({}, instance._expectedData)
          data.success = true
          onUpdateAndInsert = function (data) {
            // Model has actually been update
            for (attribute in instance._expectedData) {
              expect(model[attribute]).toBe(instance._expectedData[attribute])
            }
          }
          model.onUpdate(onUpdateAndInsert)
          model.onInsert(onUpdateAndInsert)
          originalOptions.success.call(null, data, "200", jqXHR)

          // FAILURE
          data = $.extend({}, instance._expectedData)
          data.success = false
          model.onFailure(function (data, status, xhr) {
            expect(status).toBe("200")
            expect(typeof data.success === "boolean" && !data.success).toBeTruthy()
            expect(xhr).toBe(jqXHR)
          })

          originalOptions.success.call(null, data, "200", jqXHR)

          // ERROR
          data = $.extend({}, instance._expectedData)
          model.onError(function (xhr, status, error) {
            expect(status).toBe("500")
            expect(xhr).toBe(jqXHR)
            expect(error).toBe("Something went wrong.")
          })
          originalOptions.error.call(null, jqXHR, "500", "Something went wrong.")
        })
      },
      expect: function (expectedUrl, expectedData) {
        this._expectedData = $.extend({}, expectedData, true)
        this._expectedUrl = expectedUrl
      },
      unregister: function () {
        this._isActive = false
      }
    })
  })
