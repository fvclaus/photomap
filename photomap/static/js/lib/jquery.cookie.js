/**
 * jQuery Cookie plugin
 *
 * Copyright (c) 2010 Klaus Hartl (stilbuero.de)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */
//jQuery.cookie = function (key, value, options) {

//    // key and at least value given, set cookie...
//    if (arguments.length > 1 && String(value) !== "[object Object]") {
//        options = jQuery.extend({}, options);

//        if (value === null || value === undefined) {
//            options.expires = -1;
//        }

//        if (typeof options.expires === 'number') {
//            var days = options.expires, t = options.expires = new Date();
//            t.setDate(t.getDate() + days);
//        }

//        value = String(value);

//        return (document.cookie = [
//            encodeURIComponent(key), '=',
//            options.raw ? value : cookie_encode(value),
//            options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
//            options.path ? '; path=' + options.path : '',
//            options.domain ? '; domain=' + options.domain : '',
//            options.secure ? '; secure' : ''
//        ].join(''));
//    }

//    // key and possibly options given, get cookie...
//    options = value || {};
//    var result, decode = options.raw ? function (s) { return s; } : decodeURIComponent;
//    return (result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(document.cookie)) ? decode(result[1]) : null;
//};

//function cookie_encode(string){
//	//full uri decode not only to encode ",; =" but to save uicode charaters
//	var decoded = encodeURIComponent(string);
//	//encod back common and allowed charaters {}:"#[] to save space and make the cookies more human readable
//	var ns = decoded.replace(/(%7B|%7D|%3A|%22|%23|%5B|%5D)/g,function(charater){return decodeURIComponent(charater);});
//	return ns;
//}
/*!
* jQuery Cookie Plugin v1.3
* https://github.com/carhartl/jquery-cookie
*
* Copyright 2011, Klaus Hartl
* Dual licensed under the MIT or GPL Version 2 licenses.
* http://www.opensource.org/licenses/mit-license.php
* http://www.opensource.org/licenses/GPL-2.0
*/
(function ($, document, undefined) {
                     
   var pluses = /\+/g;

   function raw(s) {
      return s;
   }

   function decoded(s) {
      return decodeURIComponent(s.replace(pluses, ' '));
   }

   var config = $.cookie = function (key, value, options) {

      // write
      if (value !== undefined) {
         options = $.extend({}, config.defaults, options);

         if (value === null) {
            options.expires = -1;
         }

         if (typeof options.expires === 'number') {
            var days = options.expires, t = options.expires = new Date();
            t.setDate(t.getDate() + days);
         }

         value = config.json ? JSON.stringify(value) : String(value);

         return (document.cookie = [
            encodeURIComponent(key), '=', config.raw ? value : encodeURIComponent(value),
            options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
            options.path ? '; path=' + options.path : '',
            options.domain ? '; domain=' + options.domain : '',
            options.secure ? '; secure' : ''
         ].join(''));
      }

      // read
      var decode = config.raw ? raw : decoded;
      var cookies = document.cookie.split('; ');
      for (var i = 0, l = cookies.length; i < l; i++) {
         var parts = cookies[i].split('=');
         if (decode(parts.shift()) === key) {
            var cookie = decode(parts.join('='));
            return config.json ? JSON.parse(cookie) : cookie;
         }
      }

      return null;
   };

   config.defaults = {};

   $.removeCookie = function (key, options) {
      if ($.cookie(key) !== null) {
         $.cookie(key, null, options);
         return true;
      }
      return false;
   };

})(jQuery, document);
