/*global require, $, QUnit*/

"use strict";

require(["view/SlideshowView",
         "keiken/test/TestFixture",
        "dojo/domReady!"],
        function (TestFixture, SlideshowView) {
           var slideshow = null,
               $testBody = $("#testBody"),
               $container = $("<section id=mp-slideshow></section>"),
               textFixture = new TestFixture(),
               photos = textFixture.getPhotos();

           $testBody
              .empty()
              .append($container);

           slideshow = new SlideshowView(null, $container.get(0));
           slideshow.startup();
           
           

           QUnit.test("Slideshow", function () {
              QUnit.ok(true);
              slideshow.start();
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
