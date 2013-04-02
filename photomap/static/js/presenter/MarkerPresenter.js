/*global $, main*/

"use strict";



var MarkerPresenter = function (view) {
   this.view = view;
};

MarkerPresenter.prototype = {
   mouseOver : function () {
      if (!main.getUI().isDisabled()) {
         main.getUI().getControls().show(this.view);
      }
   },
   mouseOut : function () {
      // hide EditControls after a small timeout, when the EditControls are not entered
      // the place is never seamlessly connected to a place, so we need to give the user some time
      main.getUI().getControls().hide(true);
   }
}
