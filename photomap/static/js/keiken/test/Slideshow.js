/*global require, $, QUnit*/

"use strict";

require(["view/SlideshowView",
         "keiken/test/TestFixture",
        "dojo/domReady!"],
        function (SlideshowView, TestFixture) {
           var slideshow = null,
               $testBody = $("#testBody"),
               $container = $("<section id=mp-slideshow></section>"),
               textFixture = new TestFixture(),
               photos = textFixture.getPhotos(12);

           $testBody
              .empty()
              .append($container);

           slideshow = new SlideshowView(null, $container.get(0));
           slideshow.startup();
           slideshow.loadPhotos(photos);
           slideshow.startCarousel();
           
           

           QUnit.test("Slideshow", function () {
              QUnit.ok(true);
           });
              

           // doh.register("Slideshow", {
           //    setUp : function () {
           //       slideshow = new SlideshowView({}, $container);
           //    },
           //    runTest : function () {
           //       doh.t(true);
           //       slideshow.start();
           //    }
           // });
           // doh.run();
        });
