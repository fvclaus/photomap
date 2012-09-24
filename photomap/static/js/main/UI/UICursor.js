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
  
  init : function(){
    this.cursors();
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
    
    // on album pics
    // defined in main.styl .mp-control
    // DragnDrop defined in UIAlbum.js after loading the pics and on "mousedown"- and "mouseup"-event (-> change: pointer ->grabber ->pointer again)
    
    // on jScrollPane
    // in jscrollpane css sheet | originally "pointer" - changed to "move"
    
    // on controls 
    // in main.styl class "mp-control" - class added to all controls
    // for fullscreen control in UISlideshow _startSlider cause adding "mp-control" class in template didn't work out well
    
    // ajax and loading cursors missing.. also cursor on controls and certain other parts..
    
  },
  
};
