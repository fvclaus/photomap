/* eslint no-unused-vars:0 */

"use strict"

var DASHBOARD_VIEW = "/dashboard/"
var ALBUM_VIEW = /album\/\d+\/view/

var ALBUM_ICON_WIDTH = 25
var ALBUM_ICON_HEIGHT = 25
var ALBUM_VISITED_ICON = "/static/images/marker-icons/suitcase-visited.png"
var ALBUM_SELECTED_ICON = "/static/images/marker-icons/suitcase-current.png"
var ALBUM_LOADED_ICON = "/static/images/marker-icons/suitcase-loaded.png"
var ALBUM_UNSELECTED_ICON = "/static/images/marker-icons/suitcase-not-visited.png"
var ALBUM_DISABLED_ICON = "/static/images/marker-icons/suitcase-disabled.png"
var ALBUM_DEFAULT_ICON = ALBUM_UNSELECTED_ICON

var PLACE_ICON_WIDTH = 18
var PLACE_ICON_HEIGHT = 15
var PLACE_VISITED_ICON = "/static/images/marker-icons/camera-visited.png"
var PLACE_SELECTED_ICON = "/static/images/marker-icons/camera-current.png"
var PLACE_LOADED_ICON = "/static/images/marker-icons/camera-loaded.png"
var PLACE_UNSELECTED_ICON = "/static/images/marker-icons/camera-not-visited.png"
var PLACE_DISABLED_ICON = "/static/images/marker-icons/camera-disabled.png"
var PLACE_DEFAULT_ICON = PLACE_UNSELECTED_ICON

var PLACE_ICON_SHADOW_WIDTH = 20
var ALBUM_ICON_SHADOW_WIDTH = 29
var PLACE_SHADOW_ICON = "/static/images/marker-icons/camera-shadow.png"
var ALBUM_SHADOW_ICON = "/static/images/marker-icons/suitcase-shadow.png"

var TEMP_TITLE_KEY = "temp_title"
var TEMP_DESCRIPTION_KEY = "temp_description"

var ZOOM_LEVEL_CENTERED = 11

var INPUT_DIALOG = 0
var CONFIRM_DIALOG = 1
var ALERT_DIALOG = 2

var KEY_CODES = {
  8: "BACKSPACE",
  9: "TAB",
  13: "ENTER",
  16: "SHIFT",
  17: "CTRL",
  18: "ALT",
  19: "PAUSE/BREAK",
  20: "CAPS LOCK",
  27: "ESCAPE",
  33: "PAGE UP",
  34: "PAGE DOWN",
  35: "END",
  36: "HOME",
  37: "LEFT ARROW",
  38: "UP ARROW",
  39: "RIGHT ARROW",
  40: "DOWN ARROW",
  45: "INSERT",
  46: "DELETE",
  48: "0",
  49: "1",
  50: "2",
  51: "3",
  52: "4",
  53: "5",
  54: "6",
  55: "7",
  56: "8",
  57: "9",
  65: "A",
  66: "B",
  67: "C",
  68: "D",
  69: "E",
  70: "F",
  71: "G",
  72: "H",
  73: "I",
  74: "J",
  75: "K",
  76: "L",
  77: "M",
  78: "N",
  79: "O",
  80: "P",
  81: "Q",
  82: "R",
  83: "S",
  84: "T",
  85: "U",
  86: "V",
  87: "W",
  88: "X",
  89: "Y",
  90: "Z",
  91: "LEFT WINDOW KEY",
  92: "RIGHT WINDOW KEY",
  93: "SELECT KEY",
  96: "Number Pad 0",
  97: "Number Pad 1",
  98: "Number Pad 2",
  99: "Number Pad 3",
  100: "Number Pad 4",
  101: "Number Pad 5",
  102: "Number Pad 6",
  103: "Number Pad 7",
  104: "Number Pad 8",
  105: "Number Pad 9",
  106: "MULTIPLY",
  107: "ADD",
  109: "SUBTRACT",
  110: "DECIMAL POINT",
  111: "DIVIDE",
  112: "F1",
  113: "F2",
  114: "F3",
  115: "F4",
  116: "F5",
  117: "F6",
  118: "F7",
  119: "F8",
  120: "F9",
  121: "F10",
  122: "F11",
  123: "F12",
  144: "NUM LOCK",
  145: "SCROLL LOCK",
  186: "SEMI-COLON",
  187: "EQUAL SIGN",
  188: "COMMA",
  189: "DASH",
  190: "PERIOD",
  191: "FORWARD SLASH",
  192: "GRAVE ACCENT",
  219: "OPEN BRACKET",
  220: "BACK SLASH",
  221: "CLOSE BRAKET",
  222: "SINGLE QUOTE"
}
