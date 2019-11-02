var allTestFiles = []
var TEST_REGEXP = /.*\.spec.js$/

Object.keys(window.__karma__.files).forEach(function (file) {
  if (TEST_REGEXP.test(file)) {
    allTestFiles.push(file.replace("/base/", "").replace(".js", ""))
  }
})

var dojoConfig = {
  async: false,
  isDebug: true,
  debugAtAllCosts: true,
  baseUrl: "/base",
  packages: [
    {
      name: "keiken",
      location: "/base/keiken"
    },
    {
      name: "dojo",
      location: "/base/dojo"
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
