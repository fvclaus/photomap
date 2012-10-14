UICursor = function(){

   this.styles = {
      'default': 'default',
      pointer: 'pointer',
      cross: 'crosshair',
      grab: 'move',
      wait: 'wait',
      text: 'text',
      info: 'help',
      stop: 'not-allowed',
      progress: 'progress',
   };
};

UICursor.prototype = {

   initWithoutAjax : function(){
      this.cursors();
      if ( main.getUIState().getPage() == ALBUM_VIEW ){
         this.setInfoCursor(this.styles.info);
      }
   },
   initAfterAjax : function(){
      this.setMapCursor();
   },

   setCursor : function ($element,style){
      $element.css('cursor',style);
   },

   setMapCursor : function(style){
      map = main.getMap().getInstance();
      if (style){
         cursor = style;
      }
      // if no style is defined -> cross on interactive pages, else grabber
      else if ( main.getUIState().isInteractive() ) {
         cursor = this.styles.cross;
      }
      else {
         cursor = this.styles.grab;
      }
      map.setOptions({
         draggableCursor: cursor,
         draggingCursor: this.styles.grab,
      });
   },
   setInfoCursor : function(style){
      $information = $(".mp-option-information");
      this.setCursor($information,style);
   },
   cursors : function() {

      // on links
      $link = $("a");
      this.setCursor($link,this.styles.pointer);

      // on faq and tutorial entries
      $question = $(".mp-faq-question");
      this.setCursor($question,this.styles.pointer);
      $topic = $(".mp-tutorial-subtopic");
      this.setCursor($topic,this.styles.pointer);

      // on toggle gallery button
      $toggleGallery = $(".mp-option-toggle-gallery");
      this.setCursor($toggleGallery,this.styles.pointer);
   },

};
