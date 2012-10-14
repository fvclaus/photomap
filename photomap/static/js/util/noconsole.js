/*
   If your browser does not have or support or have firebug installed, this script will stop any errors from being triggered upon encountering a
   console.log function or anything else under the console object.
   Thanks firebug team!

   Frederik Claus
   Original Code by http://ryan.ifudown.com/ - Ryan Rampersad

*/


(function(){
   if (console) {
      var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml", "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];
      var minConsole = true;
      names.forEach(function(name){
         if (!console.name){
            minConsole=false;
         }
      });
      if (!minConsole){
         return;
      }
   }
   window.console = {};
   for (var i = 0; i < names.length; ++i){
      window.console[names[i]] = function() {};
   }
})();






