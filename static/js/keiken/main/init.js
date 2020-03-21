/* jslint */
/* global $, $$, gettext, navigator */

"use strict"

/**
 * Photo Map
 *
 *
 * Copyright 2011 - 2012, Frederik Claus, Marc-Leon Römer
 *
 * Date: Dec 2011
 */

/**
 * @description Initializes main constructor. Needs document ready!
 */
require(["keiken/main/App", "dojo/domReady!"], function (App) {
  var app = new App(null, $("#app").get(0))
  app.startup()
})
