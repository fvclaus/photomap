define(["dojo/domReady!"], function () {
  return {
    // eslint-disable-next-line no-unused-vars
    load: function (id, require, callback) {
      var gmapsSource = document.createElement("script")
      var osmStyle = document.createElement("style")
      osmStyle.setAttribute("href", "https:// cdn.jsdelivr.net/gh/openlayers/openlayers.github.io@master/en/v6.1.1/css/ol.css")
      document.head.appendChild(gmapsSource)
      document.head.appendChild(osmStyle)
      callback()
    }
  }
})
