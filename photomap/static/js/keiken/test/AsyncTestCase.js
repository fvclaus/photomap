/*jslint forin : true */
/*global define, QUnit, assertFunction, assertString*/

"use strict";

define(["dojo/_base/declare"],
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
                     testAssertions = null,
                     nAssertions = null,
                     instance = this;


                 QUnit.module(this.name, {
                    setup : function () {
                       instance.setUp.apply(instance);
                    },
                    teardown : function () {
                       instance.tearDown.apply(instance);
                    }
                 });

                 for (attribute in this) {
                    // Most of these tests are inherited.
                    if (attribute.match(/^test/) && typeof this[attribute] === "function" && attribute.search("Assertions") === -1) {
                       testName = attribute;
                       testAssertions = this[testName + "Assertions"];

                       if (typeof testAssertions === "function") {
                          nAssertions = this[testName + "Assertions"].apply(this);
                       } else if (typeof testAssertions === "number") {
                          nAssertions = testAssertions;
                       } 

                       if (typeof nAssertions === "number" && !isNaN(nAssertions)) {
                          // Create functions in a loop to preserver the testName in a closure. Otherwise it will be overwritten.
                          (function () {
                             var thisTestName = testName,
                                 testFunction = function () {
                                    instance[thisTestName].apply(instance);
                                 };
                             QUnit.asyncTest(testName, nAssertions, testFunction);
                          }());
                             
                       } else {
                          (function () {
                             var thisTestName = testName,
                                 testFunction = function () {
                                    instance[thisTestName].apply(instance);
                                 };
                             console.warn("AsyncTestCase: Did not specify expected number of assertions for " + testName);
                             QUnit.asyncTest(testName, testFunction);
                          }());


                       }
                    }
                 }
              }
           });
        });
                       
                          