"use strict";

function croak (actual, expected) {
   throw new Error(actual + " is not " + expected);
}

function assert (actual, expected, message) {
   if (actual !== expected) {
      croak(actual, expected);
   }
}

function assertTrue (actual) {
   if (!actual) {
      croak(actual, true);
   }
}

function assertFalse (actual) {
   if (actual) {
      croak(actual, false);
   }
}

function assertNumber (actual) {
   if (!(typeof actual === "number")) {
      croak(typeof actual, "number");
   }
}

function assertString (actual) {
   if (!(typeof actual === "string")){
      croak(typeof actual, "string");
   }
}