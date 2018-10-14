'''
Based on python-nominatim by agabel
https://github.com/agabel/python-nominatim
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

# OSM has updated its usage policy and blocks all
# requests from http libraries. We should not try to
# circumvent this requirement but find another solution instead.
# Source: http://wiki.openstreetmap.org/wiki/Nominatim_usage_policy
def reversegeocode(lat, lon):
    return "??"

def reversegeocode_deprecated(lat, lon):
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

    except IOError as e:
        if data:
            raise OSMException(data["error"])
        else:
            raise OSMException("Please try again later")
    except KeyError as e:
            logger.warn("Requested location not in a country. Returning OC for ocean")
            return "oc"


if __name__ == "__main__":
    from pm.test.data import GPS_MANNHEIM_SCHLOSS
    country_code = reversegeocode(GPS_MANNHEIM_SCHLOSS["lat"], GPS_MANNHEIM_SCHLOSS["lon"])
    print(country_code)
