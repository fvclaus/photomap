UICursor = function(){
  
  this.cursor = {
      default: 'default',
      pointer: 'pointer',
      cross: 'crosshair',
      grab: 'move',
      wait: 'wait',
      text: 'text',
      help: 'help',
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
  
  cursors : function() {
    
    // on map
    map = main.getMap().getInstance();
    map.setOptions({ 
      draggableCursor: this.cursor.cross,
      draggingCursor: this.cursor.grab,
    });
    
    // on links
    $link = $("a");
    this.setCursor($link,this.cursor.pointer);
    
    // on album pics
    // defined in main.styl .mp-control
    // DragnDrop defined in UIAlbum.js after loading the pics and on "mousedown"- and "mouseup"-event (-> change: pointer ->grabber ->pointer again)
    
    // on jScrollPane
    // in jscrollpane css sheet | originally "pointer" - changed to "move"
    
    // on controls 
    // in main.styl class "mp-control" - class added to all controls
    // for fullscreen control in UISlideshow _startSlider cause adding "mp-control" class in template didn't work out well
    
    // ajax and loading cursors missing.. also cursor on controls and certain other parts..
    
    instance = this;
    $('body').ajaxStart(function(){
      instance.setCursor($('body'),instance.cursor.wait);
    });
    $('body').ajaxStop(function(){
      instance.setCursor($('body'),instance.cursor.default);
    });
    
  },
  
};
