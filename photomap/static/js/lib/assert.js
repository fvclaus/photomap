"use strict";

function croak(actual, expected, file, method, subject) {
   throw new Error(file + " > " + method + " : " + subject + " : " + actual + " is not " + expected);
}

function assert(actual, expected, file, method, subject) {
   if (actual !== expected) {
      croak(actual, expected, file, method, subject);
   }
}

function assertTrue(actual, file, method, subject) {
   if (!actual) {
      croak(actual, true, file, method, subject);
   }
}

function assertFalse(actual, file, method, subject) {
   if (actual) {
      croak(actual, false, file, method, subject);
   }
}

function assertNumber(actual, file, method, subject) {
   if (!(typeof actual === "number")) {
      croak(typeof actual, "number", file, method, subject);
   }
}

function assertString(actual, file, method, subject) {
   if (!(typeof actual === "string")){
      croak(typeof actual, "string", file, method, subject);
   }
}