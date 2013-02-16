/*jslint */

"use strict";

var DASHBOARD_VIEW, ALBUM_VIEW, PAGE_MAPPING, MARKER_DEFAULT_ICON, ALBUM_VISITED_ICON, PLACE_VISITED_ICON, PLACE_SELECTED_ICON, PLACE_UNSELECTED_ICON, PLACE_DISABLED_ICON, TEMP_TITLE_KEY, TEMP_DESCRIPTION_KEY, ZOOM_LEVEL_CENTERED, ALLOWED_UPLOAD_FILE_TYPES, ERRORS;

DASHBOARD_VIEW = "dashboard";
ALBUM_VIEW = "albumview";

PAGE_MAPPING = {
   "/dashboard" : DASHBOARD_VIEW,
   "/view-album" : ALBUM_VIEW
};



ALBUM_VISITED_ICON = "static/images/camera-visited.png";

PLACE_VISITED_ICON = "static/images/camera-visited.png";
PLACE_SELECTED_ICON = "static/images/camera-current.png";
PLACE_UNSELECTED_ICON = "static/images/camera-not-visited.png";
PLACE_DISABLED_ICON = "static/images/camera-disabled.png";

MARKER_DEFAULT_ICON = PLACE_UNSELECTED_ICON;

TEMP_TITLE_KEY = "temp_title";
TEMP_DESCRIPTION_KEY = "temp_description";

ZOOM_LEVEL_CENTERED = 13;

