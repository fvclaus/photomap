"use strict"

define(["../model/Photo"],
  function (Photo) {
    describe("Photo", function () {
      it("should create empty photo", function () {
        var photo = new Photo()
        expect(photo.getTitle()).toBeUndefined()
      })
    })
  })
