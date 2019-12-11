define(["dojo/domReady!"], function () {
  return {
    // eslint-disable-next-line no-unused-vars
    load: function (id, require, callback) {
      $("<link/>").attr({
        href: "https://cdn.jsdelivr.net/gh/openlayers/openlayers.github.io@master/en/v6.1.1/css/ol.css",
        type: "text/css",
        rel: "stylesheet"
      }).appendTo("head")
      callback()
    }
  }
})
