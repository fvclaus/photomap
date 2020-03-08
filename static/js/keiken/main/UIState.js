/* jslint */
/* global $, window, main, define, assertTrue, String, DASHBOARD_VIEW, ALBUM_VIEW */

"use strict"

/**
 * @author Frederik Claus
 * @class UIState holds the current state of the application
 */

define([
  "dojo/_base/declare",
  "dojo/domReady"
],
function (declare) {
  var UIState = declare(null, {
    constructor: function () {
      this.album = null // in albumview this refers to the loaded album
      this.albums = null // in dashboardview this is the collection of all albums
      // PAGE_MAPPING is defined in constants.js
      this.page = window.location.pathname
      this.data = {}
    },
    // --------------------------------------------------------------------
    // STORE AND RETRIEVE CURRENT ALBUM(S)----------------------------------
    // --------------------------------------------------------------------
    setAlbum: function (album) {
      this.album = album
    },
    getAlbum: function () {
      assertTrue(this.isAlbumView(), "getAlbum is used to get currently loaded album in albumview")
      return this.album
    },
    setAlbums: function (collection) {
      this.albums = collection
    },
    getAlbums: function () {
      return this.albums
    },
    // --------------------------------------------------------------------
    // UI------------------------------------------------------------------
    // --------------------------------------------------------------------
    isDashboardView: function () {
      if (this.page.search(DASHBOARD_VIEW) !== -1) {
        return true
      }
      return false
    },
    isAlbumView: function () {
      if (this.page.search(ALBUM_VIEW) !== -1) {
        return true
      }
      return false
    },
    // ------------------------------------------------------------------------
    // STORE AND RETRIEVE TEMPORARY DATA --------------------------------------
    // ------------------------------------------------------------------------
    /**
          * @description Provides a simple method to store variables temporarily
          * @param {String} key
          * @param value
          */
    store: function (key, value) {
      this.data[key] = value
    },
    /**
          * @description Counterpart for @reference{store}. Retrieves a value
          * @param {String} key
          */
    retrieve: function (key) {
      return this.data[key]
    },
    removeKey: function (key) {
      delete this.data[key]
    }
  })

  var _instance = new UIState()
  return _instance
})
