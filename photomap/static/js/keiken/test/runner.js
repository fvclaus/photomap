/*global require, QUnit, AssertionError*/

"use strict";

/* 
 * @description Asserts that the block of code will raise a AssertionError raised by @assert.js
 */
QUnit.raiseError = function(block, context) {
   // Convert arguments to a real array.
   var args = Array.prototype.slice.call(arguments),
       newBlock = null,
       message = "Code block " + (block.name === "")? block.nom : block.name,
       errorRaised = false;
   // Remove block & message parameter from arguments.
   args.shift();
   args.shift();
   // Create a function that applies all the arguments by default.
   newBlock =  function() {
      return block.apply(context, args);
   };
   // Use QUnit assertion functions on the new function.
   try {
      newBlock();
   } catch (e) {
      errorRaised = true;
      if (!(e instanceof AssertionError)) {
         QUnit.ok(false, message + " did not throw an AssertionError. It trew this instead: " + e);
      } else {
         QUnit.ok(true, "okay");
      }
   } finally {
      if (!errorRaised) {
         QUnit.ok(false, message + " was supposed to raise an AssertionError.");
      }
   }
};

QUnit.ok$1 = function ($element) {
   QUnit.ok($element.length === 1, "Selector '" + $element.selector + "' is supposed to select exactly one element");
};

QUnit.ok$0 = function ($element) {
   QUnit.ok($element.length === 0, "Selector '" + $element.selector + " is not supposed to select any elements.");
};

QUnit.ok$visible = function ($element) {
   QUnit.ok($element.is(":visible"), "Selector '" + $element.selector + "' is supposed to be visible");
};

QUnit.ok$hidden = function ($element) {
   QUnit.ok($element.is(":hidden"), "Selector '" + $element.selector + "' is supposed to be hidden");
};

QUnit.ok$text = function ($element, text) {
   QUnit.ok($element.text() === text, "Selector '" + $element.selector + " text content should be '" + text + "'.");
};

// Prevent test from running straight away.
// Start them once all modules have registered the test cases.
// QUnit does some optimization and runs the failed once fist.
// This is only possible when all test cases are known prior to starting.
QUnit.config.autostart = false;

// @author http://www.idealog.us/2006/06/javascript_to_p.html
function getTestCasesFromQueryString() {
   var query = window.location.search.substring(1);
   var vars = query.split('&');
   for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      if (decodeURIComponent(pair[0]) == "tests") {
         return decodeURIComponent(pair[1]).split(",");
      }
   }
   return [];
}


var allTestCases = ["Slideshow", "AdminGallery", "Gallery", "Fullscreen", "PhotoPages", "PhotoCarousel", "CarouselAnimation"],
    testCases = getTestCasesFromQueryString(),
    testCaseIndex;

if (testCases.length == 0) {
   testCases = allTestCases;
}

// Resolve to the full MID path.
for (testCaseIndex = 0; testCaseIndex < testCases.length; testCaseIndex++) {
   testCases[testCaseIndex] = "keiken/test/" + testCases[testCaseIndex];
}
   

require(testCases,
        function () {
           QUnit.start();
        });