'''
Created on Jul 19, 2012

@author: fredo
'''


from timeit import Timer
from urllib2 import urlopen
import matplotlib.pyplot as plt
import os
import settings

def s3request():
    urlopen("https://s3-eu-west-1.amazonaws.com/photomap/test.jpg")

def ec2request():
    urlopen("http://ec2-54-247-157-235.eu-west-1.compute.amazonaws.com:3002/static/photo/test.jpg")
    
def googlerequest():
    urlopen("http://www.google.de")

def plot(requests, label , color):
    plt.plot(requestcount, requests, color = color, marker = "o", markerfacecolor = color, label = label)

repeat = 30
s3 = Timer(stmt = s3request)
ec2 = Timer(stmt = ec2request)
google = Timer(stmt = googlerequest)

#===============================================================================
# calculate request times
#===============================================================================
print "starting s3 benchmark..."
s3times = s3.repeat(repeat = repeat, number = 1)
print "starting ec2 benchmark..."
ec2times = ec2.repeat(repeat = repeat , number = 1)
print "starting google benchmark..."
googletimes = google.repeat(repeat = repeat, number = 1)

#===============================================================================
# plot the data
#===============================================================================
requestcount = range(0, repeat)
plot(googletimes, "google.de", "green")
plot(s3times, "s3", "blue")
plot(ec2times, "ec2", "red")

graphpath = os.path.join(settings.DEBUG_PATH, "ec2-s3-request-benchmark.png")
plt.savefig(graphpath)

#===============================================================================
# dump into textfile
#===============================================================================
datapath = os.path.join(settings.DEBUG_PATH, "ec2-s3-request-benchmark.data")
data = open(datapath, "w")

data.write("ec2times: %s \n" % (str(ec2times),))
data.write("s3times: %s \n" % (str(s3times),))
data.write("googletimes: %s \n" % (str(googletimes),))
data.close()

