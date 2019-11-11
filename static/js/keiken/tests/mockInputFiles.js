"use strict"

define([], function () {
  return function (validator, isFileInputFn, mockFiles) {
    var origElementsFn = validator.elements
    spyOn(validator, "elements").and.callFake(function () {
      var elements = origElementsFn.call(this)
      for (var i = 0; i < elements.length; i++) {
        var el = elements[i]
        if (el instanceof HTMLInputElement && isFileInputFn(el)) {
          elements[i] = new Proxy(el, {
            get: function (obj, prop) {
              var value = obj[prop]
              if (typeof value === "function") {
                return function () {
                  return value.apply(obj, arguments)
                }
              } else if (prop === "files") {
                return mockFiles
              } else {
                return obj[prop]
              }
            },
            set: function (obj, prop, newVal) {
              obj[prop] = newVal
            }
          })
        }
      }
      return elements
    })
    var origElementValueFn = validator.elementValue
    spyOn(validator, "elementValue").and.callFake(function (el) {
      if (el instanceof HTMLInputElement && isFileInputFn(el)) {
        return "fileName"
      } else {
        return origElementValueFn.call(this, el)
      }
    })
  }
})
