/*global define, $, QUnit, FormData, assertFalse*/

"use strict";

define(["dojo/_base/declare"],
        function (declare) {
           return declare(null, {
              constructor : function () {
                 this._expectedUrl = null;
                 this._expectedData = null;
                 this._isActive = false;
                 this._isRegisterd = false;
              },
              register : function (model) {
                 assertFalse(this._isRegistered, "You cannot re-register the same object twice.");
                 assertFalse(this._isActive, "You cannot not register the same object twice");
                 this._isRegistred = true;
                 this._isActive = true;

                 var instance = this,
                     attribute = null,
                     data = null,
                     onUpdateAndInsert = null;
                      
                 
                 $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
                    // It is not possible to unregister ajax prefilters.
                    // When running more than one test, it will be executed every time.
                    if (!instance._isActive) {
                       return;
                    }
                    
                    QUnit.ok(originalOptions.url === instance._expectedUrl);
                    if (instance._expectedData.isPhotoUpload) {
                       QUnit.ok(!originalOptions.processData);
                       QUnit.ok(!originalOptions.cache);
                       QUnit.ok(originalOptions.data instanceof FormData);
                       // This is a controlling directive and not model data.
                       delete instance._expectedData.isPhotoUpload;
                    } else {
                       for (attribute in instance._expectedData) {
                          QUnit.ok(originalOptions.data[attribute] !== undefined);
                       }
                    }
                    jqXHR.abort();


                    model.onSuccess(function (data, status, xhr) {
                       QUnit.ok(status === "200");
                       QUnit.ok(xhr === jqXHR);
                    });

                    // Simulate different response scenarios.
                    // SUCCESS
                    data = $.extend({}, instance._expectedData);
                    data.success = true;
                    onUpdateAndInsert = function (data) {
                       // Model has actually been update
                       for (attribute in instance._expectedData) {
                          QUnit.ok(model[attribute] === instance._expectedData[attribute]);
                       }
                    };
                    model.onUpdate(onUpdateAndInsert);
                    model.onInsert(onUpdateAndInsert);
                    originalOptions.success.call(null, data, "200", jqXHR);

                    // FAILURE
                    data = $.extend({}, instance._expectedData);
                    data.success = false;
                    model.onFailure(function (data, status, xhr) {
                       QUnit.ok(status === "200");
                       QUnit.ok(typeof data.success === "boolean" && !data.success);
                       QUnit.ok(xhr === jqXHR);
                    });

                    originalOptions.success.call(null,  data, "200", jqXHR);

                    // ERROR
                    data = $.extend({}, instance._expectedData);
                    model.onError(function (xhr, status, error) {
                       QUnit.ok(status === "500");
                       QUnit.ok(xhr === jqXHR);
                       QUnit.ok(error === "Something went wrong.");
                    });
                    originalOptions.error.call(null, jqXHR, "500", "Something went wrong.");
                 });
              },
              expect : function (expectedUrl, expectedData) {
                 this._expectedData = $.extend({}, expectedData, true);
                 this._expectedUrl = expectedUrl;
              },
              unregister : function () {
                 this._isActive = false;
              }
           });
        });

              

