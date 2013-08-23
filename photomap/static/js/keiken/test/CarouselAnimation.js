/*global define, $, QUnit*/

"use strict";

define(["../util/CarouselAnimation",
         "./TestFixture",
        "dojo/domReady!"],
        function (CarouselAnimation, TestFixture) {

           var fullscreen = null,
               $testBody = $("#testBody"),
               $container = null,
               testFixture = new TestFixture(),
               photo = null,
               photos = null,
               carouselAnimation = null,
               $photo = null,
               $loader = null,
               assertOnStart = function ($photos) {
                  QUnit.ok($photos.length === 1);
                  QUnit.ok$hidden($photos);
                  QUnit.ok$visible($loader);
               },
               assertEnd = function ($photos) {
                  QUnit.ok($photos.length === 1);
                  QUnit.ok$visible($photos);
                  QUnit.ok$hidden($loader);
               },
               loadingTime = 1000,
               animationTime = 1000,
               waitingTime = 1200;

                  

           module("CarouselAnimation", {
              setup : function () {
                 $container = $("<div class='mp-gallery-tile' style='height:200px; width:200px'><img class='mp-gallery-loader mp-light-loader mp-nodisplay' src='/static/images/light-loader.gif'/> <img class='mp-thumb mp-cursor-pointer mp-control' style='min-width: 50%' /></div>");
                 $testBody
                    .empty()
                    .append($container);

                 carouselAnimation = new CarouselAnimation();

                 photo = testFixture.getRandomPhoto();
                 $photo = $testBody.find(".mp-thumb");
                 $photo.attr("src", photo.photo);

                 $loader = $testBody.find(".mp-gallery-loader");
                photos = testFixture.getRandomPhotos(1);
                 // Simple prefetching of the photos.
                 // This only works in addition with a setTimeout at the start of every testcase.
                 photos.forEach(function (photo) {
                    $("<img></img>")
                       .attr("src", photo.photo)
                       .appendTo($testBody)
                       .hide();
                 });
              },
              teardown : function () {
                 $testBody.empty();
              }
           });

           QUnit.test("animate", function () {
              // Test wrong inputs.
              QUnit.raiseError(carouselAnimation.start, carouselAnimation);
              QUnit.raiseError(carouselAnimation.start, carouselAnimation, {});
              QUnit.raiseError(carouselAnimation.end, carouselAnimation, {});
              QUnit.raiseError(carouselAnimation.end, carouselAnimation, { items : $photo });
              QUnit.raiseError(carouselAnimation.end, carouselAnimation, { items : $photo, loader : $loader});
           });

           QUnit.asyncTest("fade", 7, function () {
              setTimeout(function () {
                 carouselAnimation.start({
                    items : $photo,
                    loader : $loader,
                    "animationTime" : animationTime,
                    complete : function ($photos) {
                       assertOnStart($photos);
                       // Cannot finish fade with flip.
                       QUnit.raiseError(carouselAnimation.end, carouselAnimation, {
                          items : $photo,
                          "photos"  : photos,
                          loader : $loader,
                          srcPropertyName : "photo",
                          animation : "flip"
                       });
                       setTimeout(function () {
                          carouselAnimation.end({
                             items : $photo,
                             "photos" : photos,
                             loader : $loader,
                             srcPropertyName : "photo",
                             "animationTime" :  animationTime,
                             complete : function ($photos) {
                                assertEnd($photos);
                                QUnit.start();
                             }
                          });
                       }, waitingTime);
                    }
                 });
              }, loadingTime);
           });

           QUnit.asyncTest("flip", 7, function () {
              setTimeout(function () {
                 carouselAnimation.start({
                    items : $photo,
                    loader : $loader,
                    animation : "flip",
                    "animationTime" : animationTime,
                    complete : function ($photos) {
                       assertOnStart($photos);
                       // Cannot finish flip with fade.
                       QUnit.raiseError(carouselAnimation.end, carouselAnimation, {
                          items: $photo,
                          "photo" : photo,
                          loader : $loader,
                          srcPropertyName : "photo"});
                       setTimeout(function () {
                          carouselAnimation.end({
                             items : $photo,
                             "photos" : photos,
                             loader : $loader,
                             srcPropertyName : "photo",
                             animation : "flip",
                             "animationTime" :  animationTime,
                             complete : function ($photos) {
                                assertEnd($photos);
                                QUnit.start();
                             }
                          });
                       }, waitingTime);
                    }
                 });
              }, loadingTime);
           });

           QUnit.asyncTest("reset", 2, function () {
              setTimeout(function () {
                 carouselAnimation.start({
                    items : $photo,
                    loader : $loader,
                    "animationTime" : animationTime,
                    complete : function ($photos) {
                       // This should never be executed.
                       QUnit.ok(false);
                    }
                 });
                 carouselAnimation.destroy();
                 setTimeout(function () {
                    QUnit.ok$hidden($loader);
                    QUnit.ok$hidden($photo);
                    QUnit.start();
                 }, waitingTime);
              }, loadingTime);
           });
        });
