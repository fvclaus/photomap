var path = require("path")

module.exports = function (config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: "static/js",

    frameworks: ["jasmine", "dojo"],

    // list of files / patterns to load in the browser
    files: [
      "keiken/tests/main.js",
      {
        pattern: "lib/**",
        served: true,
        watched: false,
        included: true
      },
      {
        pattern: "keiken/**",
        served: true,
        included: false,
        watched: true
      },
      {
        pattern: "dojo/**/!(dojo).js",
        served: true,
        included: false,
        watched: false
      }
    ],

    dojo: {
      loader: path.join(__dirname, "static/js/dojo/dojo.js")
    },

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_DEBUG,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari
    // - PhantomJS
    browsers: ["Chrome"],

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    plugins: [
      // eslint-disable-next-line
      require("/home/fredo/workspace/karma-dojo"),
      "karma-jasmine",
      "karma-chrome-launcher"
    ]
  })
}
