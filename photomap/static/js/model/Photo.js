// photo is stored by in a place object, encapsulation of an marker
Photo = function(data,index) {
   this.model = 'Photo';

   this.source = data.photo;
   this.title = data.title;
   this.description = data.description;
   this.id = data.id;
   this.order = data.order;
   this.visited = main.getClientState().isVisitedPhoto(this.id);
};

Photo.prototype = {
   checkBorder : function(){
      //need reselection because anchors change
      if (this.visited){
         $("img[src='"+this.source+"']").addClass("visited");
      }
   },
   showBorder : function(bool){
      this.visited = bool;
      main.getClientState().addPhoto(this.id);
      this.checkBorder();
   },
   triggerClick : function(){
      $("img[src='"+this.source+"']").trigger("click");
   },
};
