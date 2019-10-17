/*jslint sloppy:true */

var profile = (function(){
    return {
       basePath: "static/js",
       releaseDir: "../CACHE",
       releaseName: "src",
       // copyrightLayers : "",
       action: "release",
       optimize : false,
       layerOptimize : "closure",
       mini : true,
       selectorEngine : "lite",
       packages:[{name: "dojo",
                  location: "dojo"},
                 {name: "dijit",
                  location: "dijit"},
                 // {name: "dojox",
                 //  location: "dojox"},
                 {name: "keiken",
                  location: "keiken"}],
       
       layers: {
          "js/main": {
             include: ["keiken"],
             // exclude : ["dojo", "dijit"],
             customBase : true,
             boot : true
           }
       }
    };
}());
