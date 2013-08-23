/*global define, $, QUnit, assertTrue, assertNumber, assertObject, assertFunction*/

"use strict";

define(["dojo/_base/declare",
        "dojo/_base/lang",
        "./PhotoWidget"],
       function (declare, lang, PhotoWidgetTestCase) {
           return declare([PhotoWidgetTestCase], {
              nPhotos : 12,
              constructor : function (options) {
                 assertTrue(typeof this.nPhotosInWidget === "number" && this.nPhotosInWidget > 0, "Parameter nPhotosInWidget needs to be a number.");
                 assertFunction(this.assertInfoTextPresence, "Every PhotoWidget needs to define a assertInfoText function.");
                 assertNumber(this.infoTextPresenceAssertions, "Every PhotoWidget needs to define a infoTextPresence number of assertions.");
                 this.options = $.extend({}, {
                    navigateToInsertedPhoto : false,
                 }, this.options);
              },
              testRunAssertions : function () {
                 return this.infoTextPresenceAssertions 
                    + this.photosInWidgetAssertions;
              },
              testRun : function () {
                 this.widget.startup();
                 this.widget.load(this.photoCollection);
                 this.widget.run();
                 setTimeout(lang.hitch(this, function () {
                    this.assertInfoTextPresence(false);
                    this.assertPhotosInWidget(this.getPage(0));
                    QUnit.start();
                 }), this.options.animationTime);
              },
              testStartupAssertions : function () {
                 return 4  // Errors
                    + 3 * this.photosInWidgetAssertions  
                    + 3 * this.infoTextPresenceAssertions;
              },
              testStartup : function () {
                 // No startup yet.
                 QUnit.raiseError(this.widget.run, this.widget);
                 QUnit.raiseError(this.widget.load, this.widget, this.photoCollection);
                 this.widget.startup();
                 // Multiple calls to startup
                 this.widget.startup();
                 // Wait for the tooltip to fade in.
                 // The time needs to be adjusted manually.  
                 setTimeout(lang.hitch(this, function () {
                    this.assertInfoTextPresence(true);
                    this.assertPhotosInWidget(this.getEmptyPage());
                    // No args loadPhoto.
                    QUnit.raiseError(this.widget.load, this.widget);
                    // Wrong parameter
                    QUnit.raiseError(this.widget.load, this.widget, this.photos);
                    this.widget.load(this.fixture.getRandomPhotoCollection(0));
                    // Make sure the tooltip does not go away.
                    setTimeout(lang.hitch(this, function() {
                       this.assertPhotosInWidget(this.getEmptyPage());
                       this.assertInfoTextPresence(true);
                       this.widget.load(this.photoCollection);
                       // Make sure the tooltip does not go away.
                       setTimeout(lang.hitch(this, function () {
                          this.assertInfoTextPresence(true);
                          this.assertPhotosInWidget(this.getEmptyPage());
                          QUnit.start();
                       }), 300);
                    }), 300);
                 }), 300);
              },
              testNavigateWithDirectionAssertions : function () {
                 return 2
                    + 3 * this.photosInWidgetAssertions;
              },
              testNavigateWithDirection : function () {
                 var pageIndex = 0;
                 this.widget.startup();
                 this.widget.load(this.photoCollection);
                 // navigateWithDirection is supposed to start the this.widget if it is not running yet.
                 this.widget.navigateWithDirection("right");
                 QUnit.raiseError(this.widget.navigateWithDirection, this.widget, 3);
                 QUnit.raiseError(this.widget.navigateWithDirection, this.widget, "wrong");
                 this.widget.navigateWithDirection("left");
                 setTimeout(lang.hitch(this, function () {
                    this.assertPhotosInWidget(this.getLastPage());
                    this.widget.navigateWithDirection("right");
                    setTimeout(lang.hitch(this, function () {
                       this.assertPhotosInWidget(this.getFirstPage());
                       for (pageIndex = 0; pageIndex < this.getNPages() - 1; pageIndex++) {
                       this.widget.navigateWithDirection("right");
                       }
                       setTimeout(lang.hitch(this, function () {
                          this.assertPhotosInWidget(this.getLastPage());
                          QUnit.start();
                       }), 2 *  this.options.animationTime);
                    }),  this.options.animationTime);
                 }),  this.options.animationTime);
              },
              testNavigateToAssertions : function () {
                 return 1 + 
                    4 * this.photosInWidgetAssertions;
              },
              testNavigateTo : function () {
                 this.widget.startup();
                 this.widget.load(this.photoCollection);
                 // No parameter not legal.
                 QUnit.raiseError(this.widget.navigateTo, this.widget);

                 // This should be the same as this.widget.run()
                 this.widget.navigateTo(null);
                 setTimeout(lang.hitch(this, function () {
                    this.assertPhotosInWidget(this.getPage(0));
                    // Should stay on the same page.
                    this.widget.navigateTo(this.getLastPhoto(0));
                    setTimeout(lang.hitch(this, function () {
                       this.assertPhotosInWidget(this.getPage(0));
                       // Should stay on the same page.
                       this.widget.navigateTo(this.photos[0]);
                       setTimeout(lang.hitch(this, function () {
                          this.assertPhotosInWidget(this.getPage(0));
                          // Should navigate to 2nd page.
                          this.widget.navigateTo(this.getFirstPhoto(1));
                          setTimeout(lang.hitch(this, function () {
                             this.assertPhotosInWidget(this.getPage(1));
                             QUnit.start();
                          }), this.options.animationTime);
                       }), this.options.animationTime);
                    }), this.options.animationTime);
                 }), this.options.animationTime);
              },
              testResetAssertions : function () {
                 return this.infoTextPresenceAssertions
                    + this.photosInWidgetAssertions;
              },
              testReset : function () {
                 this.widget.startup();
                 this.widget.load(this.photoCollection);
                 this.widget.run();
                 this.widget.reset();
                 setTimeout(lang.hitch(this,function () {
                    this.assertInfoTextPresence(true);
                    this.assertPhotosInWidget(this.getEmptyPage());
                    QUnit.start();
                 }), this.options.animationTime);
              },
              testInsertPhotoAssertions : function () {
                 return 1 
                    + 2 * this.photosInWidgetAssertions;
              },
              testInsertPhoto : function () {
                 var photoIndex = 0;
                 
                 // Start with an empty widget.
                 this.photoCollection = this.fixture.getRandomPhotoCollection(0);
                 this.photos = this.photoCollection.getAll();
                 this.widget.startup();
                 this.widget.load(this.photoCollection);
                 this.widget.run();

                 QUnit.raiseError(this.widget.insertPhoto, this.widget);
                 // Fill the first page with photos. This way, even widget that display only one photo have to reload the page.
                 for (photoIndex = 0; photoIndex < this.nPhotosInWidget; photoIndex++) {
                    this.photoCollection.insert(this.fixture.getRandomPhoto());
                 }

                 setTimeout(lang.hitch(this, function () {
                    this.assertPhotosInWidget(this.getPage(0));
                    // Add another photo to the 2nd page.
                    this.photoCollection.insert(this.fixture.getRandomPhoto());

                    setTimeout(lang.hitch(this, function () {
                       // The new photo should be displayed, if the widget automatically shows inserted photos.
                       if (this.options.navigateToInsertedPhoto) {
                          this.assertPhotosInWidget(this.getPage(1));
                       } else {
                          this.assertPhotosInWidget(this.getPage(0));
                       }
                       QUnit.start();
                    }), 2 * this.options.animationTime);
                 }), 2 * this.options.animationTime);
              },
              testDeletePhotoAssertions : function () {
                 return 1
                 + 3 * this.photosInWidgetAssertions 
                    + this.infoTextPresenceAssertions;
              },
              testDeletePhoto : function () {
                 var photoIndex = 0;

                 this.photoCollection = this.fixture.getRandomPhotoCollection(3 * this.nPhotosInWidget);
                 this.photos = this.photoCollection.getAll();
                 this.widget.startup();
                 this.widget.load(this.photoCollection);
                 this.widget.run();
                 this.widget.navigateTo(this.getFirstPhoto(1));

                 QUnit.raiseError(this.widget.deletePhoto, this.widget);
                 // Delete from the next page. This should not change anything.
                 this.photoCollection.delete(this.getFirstPhoto(2));

                 setTimeout(lang.hitch(this, function () {
                    // Make sure the image counter is decremented properly.
                    // Make sure the this.widget navigates to the 2nd photo.
                    this.assertPhotosInWidget(this.getPage(1));
                    // Delete from current page. Expect refresh.
                    this.photoCollection.delete(this.getFirstPhoto(1));

                    setTimeout(lang.hitch(this, function () {
                       if (this.photos.length <= this.nPhotosInWidget) {
                          this.assertPhotosInWidget(this.getPage(0));
                       } else {
                          this.assertPhotosInWidget(this.getPage(1));
                       }
                       //Delete the first photo from the first page.
                       this.photoCollection.delete(this.photos[0]);
                       setTimeout(lang.hitch(this, function () {
                          if (this.photos.length <= this.nPhotosInWidget) {
                             
                             this.assertPhotosInWidget(this.getPage(0));
                          } else {
                             this.assertPhotosInWidget(this.getPage(1));
                          }
                          this.assertInfoTextPresence(this.photos.length === 0);
                          
                          QUnit.start();
                       }), 2 * this.options.animationTime);
                    }), 2 * this.options.animationTime);
                 }), 2 * this.options.animationTime);
              },
              _slicePhotos : function (startIndex) {
                 return this.photos.slice(startIndex, startIndex + this.nPhotosInWidget);
              },
              getPage : function (pageIndex) {
                 var page =  this._slicePhotos(pageIndex * this.nPhotosInWidget),
                     photoIndex = 0,
                     photo = null,
                     foundNullValue = false;
                 // Because this.photos does not store null values, like PhotoPages, page needs to be filled with null values
                 for (photoIndex = 0; photoIndex < this.nPhotosInWidget; photoIndex++) {
                    if (foundNullValue) { 
                       photo = page[photoIndex];
                       if (!photo) {
                          foundNullValue = true;
                          page.push(null);
                       } else {
                          throw new Error("Null values are only allowed at the end of the array.");
                       }
                    }
                 }
                 return page;
              },
              getFirstPage : function () {
                 return this.getPage(0);
              },
              getLastPage : function () {
                 return this.getPage(this.getNPages() - 1);
              },
              getEmptyPage : function () {
                 var photoIndex = 0,
                     page = [];
                 for (photoIndex = 0; photoIndex < this.nPhotosInWidget; photoIndex++) {
                    page.push(null);
                 }
                 return page;
              },
              getNPages : function () {
                 var nPages =  this.nPhotos / this.nPhotosInWidget;
                 if (nPages % 1 !== 0) {
                    nPages += 1;
                 }
                 return parseInt(nPages);
              },
              getFirstPhoto : function (pageIndex) {
                 var photoIndex = -1;
                 if (this.nPhotosInWidget === 1) {
                    photoIndex = pageIndex;
                 } else {
                    photoIndex = pageIndex * this.nPhotosInWidget;
                 }
                 return this.photos[photoIndex];
              },
              getLastPhoto : function (pageIndex) {
                 var photoIndex = -1,
                     firstIndexNextPage = 0;
                 if (this.nPhotosInWidget === 1) {
                    photoIndex = pageIndex;
                 } else {
                    firstIndexNextPage = Math.max(this.nPhotosInWidget, // last index of first page
                                                  (2 * pageIndex));
                    photoIndex = firstIndexNextPage - 1;
                 }
                 return this.photos[photoIndex];
              }
           });
       });

