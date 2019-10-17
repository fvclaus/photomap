/*global define, $, QUnit, FormData*/

"use strict";

define(["dojo/_base/declare",
        "../util/ClientState"],
        function (declare, state) {

           var expectedUrl = null,
               newData = null,
               attribute = null;


           module("ClientState", {});

           QUnit.test("autoClose", function () {
              $.cookie("DialogMessage", "");
              QUnit.ok(typeof state.getDialogAutoClose() === "boolean" && !state.getDialogAutoClose());
              state.setDialogAutoClose(true);
              QUnit.ok(typeof state.getDialogAutoClose() === "boolean" && state.getDialogAutoClose());
           });

           QUnit.test("visitedPhotos", function () {
              state._parseValue("1,a,2,z,3");
              QUnit.ok(state.isVisitedPhoto({id:1}));
              QUnit.ok(state.isVisitedPhoto({id:2}));
              QUnit.ok(state.isVisitedPhoto({id:3}));
              QUnit.ok(!state.isVisitedPhoto({id:10}));
              QUnit.ok(state.visitedPhotos.length === 3);
              state._parseValue("");
              QUnit.ok(state.visitedPhotos.length === 0);
           });


           QUnit.test("quotaAndLimit", function () {
              $.cookie("used_space", "invalid");
              QUnit.ok(state.getUsedSpace() === "NaN");
              $.cookie("used_space", "10485760");
              QUnit.ok(state.getUsedSpace() === "10.0");
              
              $.cookie("quota", "invalid");
              QUnit.ok(state.getLimit() === "NaN");
              $.cookie("quota", "10485760");
              QUnit.ok(state.getLimit() === "10.0");
           });
                       

        });
