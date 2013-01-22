/*jslint */

"use strict";

var DASHBOARD_VIEW, ALBUM_VIEW, PAGE_MAPPING, MARKER_DEFAULT_ICON, ALBUM_VISITED_ICON, PLACE_VISITED_ICON, PLACE_SELECTED_ICON, PLACE_UNSELECTED_ICON, PLACE_DISABLED_ICON, TEMP_TITLE_KEY, TEMP_DESCRIPTION_KEY, ZOOM_LEVEL_CENTERED, ALLOWED_UPLOAD_FILE_TYPES, ERRORS;

DASHBOARD_VIEW = "dashboard";
ALBUM_VIEW = "albumview";

PAGE_MAPPING = {
   "/dashboard" : DASHBOARD_VIEW,
   "/view-album" : ALBUM_VIEW
};

MARKER_DEFAULT_ICON = "static/images/camera-roadmap.png";

ALBUM_VISITED_ICON = "static/images/camera-visited.png";

PLACE_VISITED_ICON = "static/images/camera-visited.png";
PLACE_SELECTED_ICON = "static/images/camera-current.png";
PLACE_UNSELECTED_ICON = "static/images/camera-roadmap.png";
PLACE_DISABLED_ICON = "static/images/camera-disabled.png";

TEMP_TITLE_KEY = "temp_title";
TEMP_DESCRIPTION_KEY = "temp_description";

ZOOM_LEVEL_CENTERED = 13;

ALLOWED_UPLOAD_FILE_TYPES = ['image/png', 'image/jpeg'];

ERRORS = {
   'TOO_MANY_PHOTOS': 'You may just upload one Photo at a time!',
   'UNALLOWED_FILE_TYPE': 'File-Type not allowed. Just *.jpeg and *.png are supported.',
   'NO_FILE_API_SUPPORT': 'The File APIs (DragnDrop) are not fully supported in this browser. Please upgrade to a newer version.',
   'NO_XHR2_SUPPORT': "Error initializing XMLHttpRequest! Not compatible with this browser. Please upgrade to a newer version."
};