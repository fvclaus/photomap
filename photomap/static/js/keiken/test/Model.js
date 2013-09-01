/*global define, $, QUnit, FormData*/

"use strict";

define(["dojo/_base/declare",
        "../model/Model"],
        function (declare, Model) {
           var model = null,
               expectedUrl = null,
               newData = null,
               attribute = null;


           module("Model", {});

           QUnit.test("basic", function () {
              model = new Model({title : "fancy title", id : -1, type : "Person"});
              QUnit.raiseError(model.set, model, "id", 2);
              QUnit.raiseError(model.set, model, "type", "BeautifulTree");
              QUnit.raiseError(model.set, model, "prototype", null);
              // Set title
              model.set("title", "new");
              QUnit.ok(model.title === "new");
              model.setTitle("newnew");
              QUnit.ok(model.title === "newnew");
              QUnit.ok(model.getTitle() === "newnew");
              // Set description
              model.set("description", "new");
              QUnit.ok(model.description, "new");
              model.setDescription("newnew");
              QUnit.ok(model.description === "newnew");
              QUnit.ok(model.getDescription() === "newnew");
              // Type
              QUnit.ok(model.getType() === "Person");
              // Id
              QUnit.ok(model.getId() === -1);
           });
        });