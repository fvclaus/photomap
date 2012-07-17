# -*- coding: utf8 -*-
'''
Created on Jul 17, 2012

@author: fredo
'''

from pm.model.album import Album
from pm.model.place import Place
from pm.model.photo import Photo
from django.conf import settings
import os
import re
#http://www.profv.de/texcaller/group__python.html
from texcaller import escape_latex, convert

def export(albumid):
    album = Album.objects.get(pk = albumid)
    




class LatexExport():
    
    
    INDEX_TEMPLATE = open(os.path.join(settings.LATEX_PATH, "index.tex"), "r").read()
    PLACE_TEMPLATE = open(os.path.join(settings.LATEX_PATH, "place.tex"), "r").read()
    PHOTO_TEMPLATE = open(os.path.join(settings.LATEX_PATH, "photo.tex"), "r").read()
    LATEX_ESCAPE = re.compile("title|description")
    
    
    def __init__(self, album):
        self.index = self.INDEX_TEMPLATE
        self.index = self.replace(self.index, [("!photo-path!", settings.PHOTO_PATH + os.path.sep),
                                         ("!album-title!", album.title)])
        self.content = ""
        self.photocount = 1
        
        places = Place.objects.all().filter(album = album)[:3]
    
        for place in places:
            self.addplace(place)
            photos = Photo.objects.all().filter(place = place)
            
            
            for photo in photos:
                self.addphoto(photo)
        
        self.index = self.index.replace("!content!", self.content)
        
        open(os.path.join(settings.LATEX_PATH, "out.tex"), "wb").write(self.index.encode("euc-jp"))
        pdf, info = convert(self.index, 'LaTeX', 'PDF', 5)
       
        open(os.path.join(settings.LATEX_PATH, "out.pdf"), "wb").write(pdf)
        print self.index
            
    
    def addplace(self, place):
        placelatex = self.PLACE_TEMPLATE
        placelatex = self.replace(placelatex, [("!place-title!", place.title),
                                               ("!place-description!", place.description)])
        self.content += placelatex
        
    def addphoto(self, photo):
        photolatex = self.PHOTO_TEMPLATE
        position = "right"
        if self.photocount % 2 == 1:
            position = "left" 
        description = photo.description.replace("\n", " ")
        photolatex = self.replace(photolatex, [("!position!", position),
                                               ("!photo-filename!", os.path.split(photo.photo.path)[1]),
                                               ("!photo-title!", photo.title),
                                               ("!photo-description!", description)])
        self.photocount += 1
        self.content += photolatex
    
    def replace(self, target, rules):
        for rule in rules:
            content = rule[1]
            if self.LATEX_ESCAPE.search(rule[0]):
                content = escape_latex(rule[1])
                content = self.replace(content, [("ä", "\"a"),
                                                 ("Ä", "\"A"),
                                                 ("ö", "\"o"),
                                                 ("Ö", "\"ö"),
                                                 ("ü", "\"u"),
                                                 ("Ü", "\"U"),
                                                 ("ß", "ss")])
            target = target.replace(rule[0], content)
        return target
    
if __name__ == "__main__":
    albums = Album.objects.all().filter(title = "Japan 2011/2012")
    LatexExport(albums[len(albums) - 1])
