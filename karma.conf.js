var path = require("path")

var port = 9876

module.exports = function (config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: ".",

    frameworks: ["jasmine", "dojo"],

    reporters: ["kjhtml"],

    preprocessors: {
      "static/styles/**/*.styl": ["stylus"]
    },

    stylusPreprocessor: {
      options: {
        paths: ["static/styles"]
      }
    },

    // list of files / patterns to load in the browser
    files: [
      "static/js/keiken/tests/main.js",
      "static/styles/viewalbum-main.styl",
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
        pattern: "node_modules/dijit/**",
        served: true,
        included: false,
        watched: false
      },
      {
        pattern: "node_modules/dojox/**",
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
    logLevel: config.LOG_DEBUG,

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
