/*global define, $, QUnit, FormData*/

"use strict";

define(["dojo/_base/declare",
        "../model/Photo"],
        function (declare, Photo) {
           var photo = null,
               expectedUrl = null,
               newData = null,
               attribute = null,
               isPhotoTest = true;


           module("Photo", {
              setup : function () {
                 isPhotoTest = true;
              },
              teardown : function () {
                 isPhotoTest = false;
              }
           });

           QUnit.test("easy", function () {
              photo = new Photo({ title : "Blah", 
                                   photo : "photo",
                                   thumb : "thumb",
                                   order : 2 });
              QUnit.ok(photo.getOrder() === 2);
              QUnit.ok(photo.getPhoto() === "photo");
              QUnit.ok(photo.getThumb() === "thumb");
              QUnit.ok(photo.isVisited() === false);
              photo.setVisited(true);
              QUnit.ok(photo.isVisited() === true);
              QUnit.ok(typeof photo.toString() === "string");
              QUnit.ok(photo.getSource("photo") === "photo");
              QUnit.ok(photo.getSource("thumb") === "thumb");
           });

           QUnit.test("hard", 25, function () {
              var onUpdateAndInsert = null,
                  data = null;
              photo = new Photo({title : "old", id : -1});
              $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
                 // It is not possible to unregister ajax prefilters.
                 // When running more than one test, it will be executed every time.
                 if (!isPhotoTest) {
                    return;
                 }
                 
                 QUnit.ok(originalOptions.url === expectedUrl);
                 if (newData.isPhotoUpload) {
                    QUnit.ok(!originalOptions.processData);
                    QUnit.ok(!originalOptions.cache);
                    QUnit.ok(originalOptions.data instanceof FormData);
                    // This is a controlling directive and not photo data.
                    delete newData.isPhotoUpload;
                 } else {
                    for (attribute in newData) {
                       QUnit.ok(originalOptions.data[attribute] !== undefined);
                    }
                 }
                 jqXHR.abort();


                 photo.onSuccess(function (data, status, xhr) {
                    QUnit.ok(status === "200");
                    QUnit.ok(xhr === jqXHR);
                 });

                 // Simulate different response scenarios.
                 // SUCCESS
                 data = $.extend({}, newData);
                 data.success = true;
                 onUpdateAndInsert = function (data) {
                    // Photo has actually been update
                    for (attribute in newData) {
                       QUnit.ok(photo[attribute] === newData[attribute]);
                    }
                 };
                 photo.onUpdate(onUpdateAndInsert);
                 photo.onInsert(onUpdateAndInsert);
                 originalOptions.success.call(null, data, "200", jqXHR);

                 // FAILURE
                 data = $.extend({}, newData);
                 data.success = false;
                 photo.onFailure(function (data, status, xhr) {
                    QUnit.ok(status === "200");
                    QUnit.ok(typeof data.success === "boolean" && !data.success);
                    QUnit.ok(xhr === jqXHR);
                 });

                 originalOptions.success.call(null,  data, "200", jqXHR);

                 // ERROR
                 data = $.extend({}, data);
                 photo.onError(function (xhr, status, error) {
                    QUnit.ok(status === "500");
                    QUnit.ok(xhr === jqXHR);
                    QUnit.ok(error === "Something went wrong.");
                 });
                 originalOptions.error.call(null, jqXHR, "500", "Something went wrong.");
              });
              expectedUrl = "/photo/";
              newData = {"title" : "new"};
              photo.save(newData);
              photo.id = 5;
              expectedUrl = "/photo/5/";
              newData = {"description" : "new", isPhotoUpload : true};
              photo.save(newData);
           });
        });
              
           