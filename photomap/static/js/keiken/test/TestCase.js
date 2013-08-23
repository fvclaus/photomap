/*global require, QUnit, assertFunction, assertString*/

"use strict";

require(["dojo/_base/declare"],
        function (declare) {
           return declare(null, {
              constructor : function () {
                 assertFunction(this.setUp, "Every TestCase needs to define a setup function.");
                 assertFunction(this.tearDown, "Every TestCase needs to define a teardown function.");
                 assertString(this.name, "Every TestCase needs a name for identification.");
              },
              run : function () {
                 var attribute = null,
                     testName = null,
                     nAssertions = null,
                     instance = this,
                     testFunction = function () {
                        instance[testName].apply(instance);
                     };

                 QUnit.module(this.name, {
                    setup : this.setUp,
                    teardown : this.tearDown
                 });

                 for (attribute in this) {
                    if (attribute.match(/^test/)) {
                       testName = attribute;
                       nAssertions = null;
                       try {
                          nAssertions = parseInt(this[testName + "Assertions"]);
                       } catch (e) {
                          console.warn("Did not the expected number of assertions for " + testName);
                       }

                       if (typeof nAssertions === "number") {
                          QUnit.asyncTest(testName, nAssertions, testFunction);
                       } else {
                          QUnit.asyncTest(testName, testFunction);
                       }
                    }
                 }
              }
           });
        });
                       
                          