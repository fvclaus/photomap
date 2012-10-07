'''
Created on Mar 20, 2012

Based on python-nominatim by agabel 
https://github.com/agabel/python-nominatim

@author: fredo
'''

from pm.exception import OSMException
from decimal import Decimal
import urllib
import logging

import json


"""Nominatim never returns any error message. 
    It tries to match with the Point that is closest, even if no parameters are given"""

BASE_URL = "http://nominatim.openstreetmap.org/"
REVERSE_URL = BASE_URL + "reverse?format=json&%s"
ZOOM = 18

logger = logging.getLogger(__name__)

def reversegecode(lat, lon):
    """Performs a lookup and return the nearest adress"""
    params = {}
    
    if not lat or not lon:
        raise OSMException("Both, lat and lon, must be specified!")
    
    params["lat"] = str(lat)
    params["lon"] = str(lon)
    params["zoom"] = ZOOM
    
#    logger.debug("Building url with %s" % urllib.urlencode(params))
    url = REVERSE_URL % urllib.urlencode(params)
    logger.debug("Asking %s..." % url)
    try :
        data = urllib.urlopen(url)
        response = data.read()
        
        data = json.loads(response)
        logger.debug("Received OSM response %s" % data)
        return data["address"]["country_code"]
    
    except IOError, e:
        if data:
            raise OSMException(data["error"])
        else:
            raise OSMException , "Please try again later"
    except KeyError, e:
        raise OSMException, "Nothing seems to be here. Try somewhere else."


if __name__ == "__main__":
    from pm.test.data import GPS_MANNHEIM_SCHLOSS
    country_code = reversegecode(GPS_MANNHEIM_SCHLOSS["lat"], GPS_MANNHEIM_SCHLOSS["lon"])
    print country_code


