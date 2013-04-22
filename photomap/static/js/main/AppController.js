/*jslint */
/*global $, define, init, initTest, finalizeInit, assertTrue, gettext */

"use strict";

/**
 * @author Frederik Claus, Marc-Leon Roemer
 * @class Controls communication in between the classes of KEIKEN
 */

define(["dojo/_base/declare", "util/Communicator"], 
       function (declare, communicator) {
          return declare(null, {
             
             constructor : function () {
                communicator.subscribe("mouseover:marker", this._handleMarkerMouseover);
                communicator.subscribe("mouseout:marker", this._handleMarkerMouseout);
             },
             _handleMarkerMouseover : function (context) {
                main.getUI().getControls().show(context);
             },
             _handleMarkerMouseout : function () {
                main.getUI().getControls().hide(true);
             }
          });
       });

