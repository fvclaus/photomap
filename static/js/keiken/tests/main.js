var allTestFiles = []
var TEST_REGEXP = /.*\.spec.js$/

Object.keys(window.__karma__.files).forEach(function (file) {
  if (TEST_REGEXP.test(file)) {
    allTestFiles.push(file.replace("/base/static/js/", "").replace(".js", ""))
  }
})

var dojoConfig = {
  async: true,
  isDebug: true,
  debugAtAllCosts: true,
  baseUrl: "/base",
  packages: [
    {
      name: "keiken",
      location: "/base/static/js/keiken"
    },
    {
      name: "dojo",
      location: "/base/node_modules/dojo"
    },
    {
      name: "dijit",
      location: "/base/node_modules/dijit"
    },
    {
      name: "dojox",
      location: "/base/node_modules/dojox"
    }
  ]
}

/**
 * This function must be defined and is called back by the dojo adapter
  * @returns {string} a list of dojo spec/test modules to register with your testing framework
 */
window.__karma__.dojoStart = function () {
  return allTestFiles
}

// Mock gettext() function
// This does not work in AMD module if modules are loaded synchronously.
// Maybe move to test_lib/ folder?
window.gettext = function (text) {
  return text
}

window.interpolate = function (fmt, obj, named) {
  if (named) {
    return fmt.replace(/%\(\w+\)s/g, function (match) {
      return String(obj[match.slice(2, -2)])
    })
  } else {
    return fmt.replace(/%s/g, function (match) {
      return String(obj.shift())
    })
  }
}
