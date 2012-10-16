/*
 * @author Frederik Claus
 * @class Base class for both Album and Place.
 */
InfoMarker = function(data){
   
   this.title = data.title;
   this.id = data.id;
   this.description = data.description;

   this.marker = new Marker({
      lat: parseFloat(data.lat),
      lng: parseFloat(data.lon),
      title: this.title
   });

};

InfoMarker.prototype = {
   getSize : function(){
      return this.marker.getSize();
   },
   getLat : function(){
      return this.marker.lat;
   },
   getLng : function(){
      return this.marker.lng;
   },
   getLatLng : function(){
      map = main.getMap();
      return map.createLatLng(this.getLat(),this.getLng());
   },
   triggerClick : function(){
      var map = main.getMap();
      google.maps.event.trigger(this.marker.MapMarker,"click");
   },
   center : function(){
      var map = main.getMap().getInstance();
      map.setZoom(ZOOM_LEVEL_CENTERED);
      map.panTo(this.marker.MapMarker.getPosition());
   },
   showVisitedIcon : function(){
      this.marker.setOption({icon: PLACE_VISITED_ICON});
   },
   showSelectedIcon : function(){
      this.marker.setOption({icon: PLACE_SELECTED_ICON});
   },
   showUnselectedIcon : function(){
      this.marker.setOption({icon: PLACE_UNSELECTED_ICON});
   },
   showDisabledIcon : function(){
      this.marker.setOption({icon: PLACE_DISABLED_ICON});
   },
   /*
    * @description Shows the album on the map
    */
   show : function(){
      this.marker.show();
   },
   /*
    * @description Adds an listener to an event triggered by the Marker
    * @param {String} event
    * @param {Function} callback
    */
   addListener : function(event,callback){
      if (!(event && callback)){
         alert("You must specify event as well as callback");
         return;
      }
      google.maps.event.addListener(this.marker.MapMarker,event,callback);
   },
};
