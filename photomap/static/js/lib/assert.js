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