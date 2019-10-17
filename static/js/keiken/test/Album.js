/*global define, $, QUnit, FormData*/

"use strict";

define(["dojo/_base/declare",
        "../model/Album",
        "../model/Collection"],
       function (declare, Album, Collection) {
           var album = null,
               places = null;


           module("Album", {});

           QUnit.test("easy", function () {
              album = new Album({
                 title : "new",
                 id : 10,
                 places : [{
                    title : "new",
                    id : 10,
                    photos : [{
                       title : "1",
                       id : -1 
                    }, {
                       title : "2",
                       id : -1
                    }]
                 }]
              });
              places = album.getPlaces();
              QUnit.ok(places instanceof Collection);
              QUnit.ok(places.size() === 1);
              QUnit.ok(album.getTitle() === "new");
              QUnit.ok(album.isOwner() === false);
              
              album = new Album({
                 title : "new", 
                 isOwner : true,
                 places : []
              });
              QUnit.ok(album.isOwner() === true);
           });
       });
