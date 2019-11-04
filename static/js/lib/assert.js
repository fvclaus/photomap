/* eslint no-unused-vars:0 */
"use strict"

function AssertionError (message) {
  this.message = message
}

AssertionError.prototype.toString = function () {
  return this.message
}

function croak (actual, expected, message) {
  if (message === undefined || typeof message !== "string") {
    throw new Error("AssertMustProvideMessage")
  }
  throw new AssertionError(actual + " is not " + expected + " -- " + message)
}

function assert (actual, expected, message) {
  if (actual !== expected) {
    croak(actual, expected, message)
  }
}

function assertTrue (actual, message) {
  if (!actual) {
    croak(actual, true, message)
  }
}

function assertEqual (actual, expected, message) {
  if (actual !== expected) {
    croak(actual, expected, message)
  }
}

function assertFalse (actual, message) {
  if (actual) {
    croak(actual, false, message)
  }
}

function assertNumber (actual, message) {
  if (!(typeof actual === "number")) {
    croak(typeof actual, "number", message)
  }
}

function assertFunction (actual, message) {
  if (!(typeof actual === "function")) {
    croak(typeof actual, "function", message)
  }
}

function assertString (actual, message) {
  if (!(typeof actual === "string")) {
    croak(typeof actual, "string", message)
  }
}

function assertInstance (instance, clazz, message) {
  if (!(instance instanceof clazz)) {
    croak(typeof instance, clazz, message)
  }
}

function assertObject (actual, message) {
  if (!(typeof actual === "object")) {
    croak(typeof actual, "object", message)
  }
}

function assertNotNull (actual, message) {
  if (actual === null || actual === undefined) {
    croak(actual, null, message)
  }
}
