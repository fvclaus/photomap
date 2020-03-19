define(["dojo/domReady!"], function () {
  return {
    // eslint-disable-next-line no-unused-vars
    load: function (id, require, callback) {
      var imageUrlDefinitions = [{
        modelName: "Album",
        url: "/static/images/marker-icons/album.png"
      }, {
        modelName: "Place",
        url: "/static/images/marker-icons/place.png"
      }]

      var areAllImagesLoaded = function () {
        return imageUrlDefinitions.reduce(function (loadStatus, definition) {
          return loadStatus && definition.isLoaded
        }, true)
      }

      var definitionsToMap = function (imageUrlDefinitions) {
        return imageUrlDefinitions.reduce(function (map, definition) {
          map[definition.modelName] = definition.img
          return map
        }, {})
      }

      imageUrlDefinitions.forEach(function (definition) {
        definition.isLoaded = false
        var img = new Image()
        img.onload = function () {
          definition.isLoaded = true

          if (areAllImagesLoaded()) {
            callback(definitionsToMap(imageUrlDefinitions))
          }
        }
        img.src = definition.url
        definition.img = img
      })
    }
  }
})
