"use strict";

function croak(actual, expected, message) {
   if (message === undefined || typeof message !== "string") {
      throw new Error("AssertMustProvideMessage");
   }
   throw new Error(actual + " is not " + expected + " -- " + message);
}

function assert(actual, expected, message) {
   if (actual !== expected) {
      croak(actual, expected, message);
   }
}

function assertTrue(actual, message) {
   if (!actual) {
      croak(actual, true, message);
   }
}

function assertFalse(actual, message) {
   if (actual) {
      croak(actual, false, message);
   }
}

function assertNumber(actual, message) {
   if (!(typeof actual === "number")) {
      croak(typeof actual, "number", message);
   }
}

function assertString(actual, message) {
   if (!(typeof actual === "string")) {
      croak(typeof actual, "string", message);
   }
}

function assertInstance(instance, clazz, message) {
   if (!(instance instanceof clazz)){
      croak(typeof instance, clazz, message);
   }
}


function assertNotNull(actual, message) {
   if (actual === null) {
      croak(actual, null, message);
   }
}