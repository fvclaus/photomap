/*global define, $, QUnit*/

"use strict";

define(["dojo/_base/declare",
         "../widget/FullscreenWidget",
         "./MultiplePagesPhotoWidget",
        "dojo/domReady!"],
        function (declare, FullscreenWidget, PhotoWidgetTestCase) {

           var FullscreenTest = declare([PhotoWidgetTestCase], {
              name : "Fullscreen",
              $containerTemplate : $("<section id=mp-fullscreen></section> "),
              PhotoWidget : FullscreenWidget,
              nPhotosInWidget : 1,
              photosInWidgetAssertions : 4,
              assertPhotosInWidget : function (photos) {
                 var photo = photos[0], 
                     $image = $("#mp-fullscreen-image"),
                     $title = $("#mp-fullscreen-title");

                  QUnit.ok$hidden($(".mp-fullscreen-loader"));
                  if (photo) {
                     QUnit.ok$visible($image);
                     QUnit.ok$text($title, photo.title);
                     QUnit.ok(parseInt($image.attr("data-keiken-id")) === photo.id, "The fullscreen image should display the photo with id " + photo.id);
                  } else {
                     QUnit.ok($image.attr("src") === undefined);
                     QUnit.ok$text($title, "");
                     QUnit.ok($image.attr("data-keiken-id") === undefined, "The fullscreen image should not have a data attribute");
                  }
              },
              infoTextPresenceAssertions : 0,
              assertInfoTextPresence : function () {}
           }),
               test = new FullscreenTest({});

           test.run();
        });

           

