/*jslint */
/*global $, define, QUnit, module */

"use strict";

define([
   "../util/InfoText",
   "./TestFixture"
],
   function (InfoText, TestFixture) {
      //TODO setup: need infotext, container, 2 random messages, 
      //TODO test alert (mask, textContainer, text, closeOnClick, closeonescape, timeout before closing
      //TODO test unique ids of different infotexts
      //TODO test interference of different infotext fading times
      //TODO test startup
      //TODO test open (size, textContainer, text)
      //TODO test hide (textContainer)
      //TODO test setter (setMessage, setOption, setContainer)
      //TODO test fadingAnimations (click, escape, mouseenter, mouseleave) (!) be aware that user might enter and leave container multiple times before fading is done (!) -> test stop animation
      //TODO test close -> no fadein unless .open()
   });