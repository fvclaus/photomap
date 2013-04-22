/*global $, main, define*/

"use strict";


define(["dojo/_base/declare", "util/Communicator"],
       function (declare, communicator) {
          return declare(null , {
             constructor : function (view) {
                this.view = view;
             },

             mouseOver : function () {
                if (!main.getUI().isDisabled()) {
                   var instance = this;
                   communicator.publish("mouseover:marker", {
                      view: instance.view,
                      presenter: instance
                   });
                   //TODO circular reference starting at the models
                   //main.getUI().getControls().show(instance.view, instance);
                }
             },
             mouseOut : function () {
                // hide EditControls after a small timeout, when the EditControls are not entered
                // the place is never seamlessly connected to a place, so we need to give the user some time
                communicator.publish("mouseout:marker");
                   //TODO circular reference starting at the models
                //main.getUI().getControls().hide(true);
             },
             update : function () {
                 var input = main.getUI().getInput(),
                     model = this.view.model.toLowerCase(),
                     instance = this;

                 input.show({
                    load : function () {
                       $("input[name=id]").val(instance.view.id);
                       this.$title = $("input[name=title]").val(instance.view.title);
                       this.$description = $("textarea[name=description]").val(instance.view.description);
                    },
                    submit : function () {
                       //reflect changes locally
                       this._title = this.$title.val();
                       this._description = this.$description.val();
                    },
                    success : function () {
                       instance.view.title = this._title;
                       instance.view.description = this._description;
                       communicator.publish("change:" + model, instance.view);
                    },
                    url : "/update-" + model,
                    context : this
                 });
              },
              delete : function () {
                var input = main.getUI().getInput(),
                    model = this.view.model.toLowerCase(),
                    instance = this;
                    
                input.show({
                   type : CONFIRM_DIALOG,
                   load : function () {
                      $("input[name='id']").val(instance.view.id);
                      $("span#mp-dialog-" + model + "-title").text(instance.view.title + "?");
                   },
                   success : function () {
                      communicator.publish("delete:" + model, instance.view);
                   },
                   url: "/delete-" + model,
                   context : this
                });
             },
             share : function () {
                 var input = main.getUI().getInput(),
                     model = this.view.model.toLowerCase(),
                     instance = this;

                 input.show({
                    url : "/update-album-password",
                    load : function () {
                       $("input[name='album']").val(instance.view.id);
                       $("input[name='share']").val("http://" + window.location.host + "/album/view/" + instance.view.secret + "-" + instance.view.id);
                       // $("input[name='share']").val(
                       // copy to clipboard with jquery (zclip) using ZeroClipboard (javascript and flash)
                       $("#mp-copy-share").zclip({
                          path: 'static/js/zeroclipboard/zeroclipboard.swf',
                          copy: $("input[name='share']").val()
                       });
                    },
                    context : this
                 });
              },
          });
       });
