/*jslint sloppy:true */

var profile = (function(){
   var isJS = function (filename) { 
      return (/\.js$/).test(filename);
   },
       isPlainJS = function (filename) {
          var name = filename.match(/[^\/]+$/)[0];
          return isJS(filename) && (/^[a-z]/).test(name) && !/nls/.test(filename) && name !== "main.js" && name !== "init.js";
       };
                                                              
          
          
   
    return {
        resourceTags: {
           amd: function(filename, mid) {
              return isJS(filename);
           },
           test : function (filename, mid) {
              return (/test/).test(mid);
           },
           copyOnly : function (filename, mid) {
              var list = {
                 "keiken/profile" : true,
                 "keiken/package.json" : true
              };

              return list[mid] !== undefined || isPlainJS(filename);
           }
        }
    };
}());