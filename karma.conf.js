var path = require("path")

var port = 9877

var isDevelopMachine = function () {
  return process.env.CUSTOM_KARMA === "true"
}

// Karma does currently not supported nocache on pre-processed files: https://github.com/karma-runner/karma/issues/2264
// I made a fix for it that may or may not be part of the official release at some point: https://github.com/fvclaus/karma/tree/force-preprocess-v2
// It is necessary to soft link jasmine and jasmine-core in the checkout node_modules folder to avoid a different version of those libraries to be used.
// Use CUSTOM_KARMA=true NODE_PATH=node_modules/ ../karma/bin/karma start to start.
var makeNoCacheFilePatternIfSupported = function (fileName) {
  if (isDevelopMachine()) {
    return {
      pattern: fileName,
      nocache: true
    }
  } else {
    return fileName
  }
}

module.exports = function (config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: ".",

    frameworks: ["jasmine", "dojo"],

    reporters: ["kjhtml"],

    preprocessors: {
      "static/**/*.styl": ["stylus"]
    },

    stylusPreprocessor: {
      options: {
        paths: ["static/styles"]
      }
    },

    // list of files / patterns to load in the browser
    files: [
      "static/js/keiken/tests/main.js",
      makeNoCacheFilePatternIfSupported("static/styles/viewalbum-main.styl"),
      makeNoCacheFilePatternIfSupported("static/test/tests.styl"),
      {
        pattern: "static/js/lib/**",
        served: true,
        watched: false,
        included: true
      },
      {
        pattern: "static/css/**/*.css",
        type: "css",
        served: true,
        watched: false,
        included: true
      },
      {
        pattern: "static/css/**/*!(.css)",
        served: true,
        included: false,
        watched: true
      },
      {
        pattern: "static/js/keiken/**",
        served: true,
        included: false,
        watched: true
      },
      {
        // Must exclude dojo.js, because it is served by dojo-karma.
        // If included here, it will be ignored and never loaded.
        pattern: "node_modules/dojo/**/!(dojo).js",
        served: true,
        included: false,
        watched: false
      },
      {
        pattern: "node_modules/+(" + [
          "dijit",
          "dojox",
          "jasmine-jquery-matchers"].join("|") + ")/**",
        served: true,
        included: false,
        watched: false
      },
      {
        pattern: "static/images/**",
        served: true,
        included: false,
        watched: false,
        nocache: false
      },
      {
        pattern: "static/test/**",
        served: true,
        included: false,
        watched: false,
        nocache: false
      }
    ],

    proxies: {
      "/static": "http://localhost:" + port + "/base/static"
    },

    dojo: {
      loader: path.join(__dirname, "node_modules/dojo/dojo.js")
    },

    port: port,

    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    browsers: ["Chrome"],

    singleRun: false,

    plugins: [
      "karma-dojo",
      "karma-jasmine",
      "karma-chrome-launcher",
      "karma-stylus-preprocessor",
      "karma-jasmine-html-reporter"
    ]
  })
}
