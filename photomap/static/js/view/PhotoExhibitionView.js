/*global define, assertTrue*/

"use strict";

define(["dojo/_base/declare",
        "view/View",
        "view/PhotoCarouselView",
        "model/Photo"],
       function (declare, View, PhotoCarouselView, Photo) {
          return declare(View, {
             load : function (photos) {
                this.reset();
                this.carousel = new PhotoCarouselView(this.get$Photos(), photos, this._srcPropertyName, this._options);
             },
             restart : function (photos) {
                this.carousel.update(photos);
             },
             insertPhoto : function (photo) {
                assertTrue(photo instanceof Photo);
                this.carousel.insertPhoto(photo);
             },
             deletePhoto : function (photo) {
                this.carousel.deletePhoto(photo);
             },
             resetPlace : function (place) {
                if (state.getCurrentLoadedPlace().getModel() === place) {
                   this.reset();
                }
             },
          });
       });

