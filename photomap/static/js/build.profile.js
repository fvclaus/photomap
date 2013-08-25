/*jslint sloppy:true */

var profile = (function(){
    return {
       basePath: ".",
       releaseDir: "build",
       releaseName: ".",
       action: "release",
       // optimize : "closure",
       packages:[{name: "dojo",
                  location: "dojo"},
                 {name: "dijit",
                  location: "dijit"},
                 // {name: "dojox",
                 //  location: "dojox"},
                 {name: "keiken",
                  location: "keiken"}],
       
       layers: {
          "build/main": {
              include: ["keiken"],
              exclude : ["dojo", "dijit"]
           }
       }
    };
}());
