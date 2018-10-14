# -*- coding: utf-8 -*-
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
# http://www.profv.de/texcaller/group__python.html
import latexcodec






class LatexExport():


    INDEX_TEMPLATE = open(os.path.join(settings.LATEX_PATH, "index.tex"), "r").read()
    PLACE_TEMPLATE = open(os.path.join(settings.LATEX_PATH, "place.tex"), "r").read()
    PHOTO_TEMPLATE = open(os.path.join(settings.LATEX_PATH, "photo.tex"), "r").read()
    LATEX_ESCAPE = re.compile("title|description")


    def __init__(self, album):
        self.index = self.INDEX_TEMPLATE
        self.index = self.replace(self.index, [("!graphics-path!", settings.PHOTO_PATH + os.path.sep),
                                         ("!album-title!", album.title)])
        self.content = ""
        self.total = 1

        places = Place.objects.all().filter(album = album)

        for place in places:
            self.addplace(place)
            photos = Photo.objects.all().filter(place = place)


            for photo in photos:
                self.addphoto(photo)

        self.index = self.index.replace("!content!", self.content

        open(os.path.join(settings.DEBUG_PATH, "out.tex"), "wb").write(self.index)

#        pdf, info = convert(self.index, 'LaTeX', 'PDF', 5)

#        open(os.path.join(settings.LATEX_PATH, "out.pdf"), "wb").write(pdf)
        print(self.index)


    def addplace(self, place):
        placelatex = self.PLACE_TEMPLATE
        placelatex = self.replace(placelatex, [("!place-title!", place.title),
                                               ("!place-description!", place.description)])
        self.content += placelatex
        self.placetotal = 0

    def addphoto(self, photo):
        photolatex = self.PHOTO_TEMPLATE
        position = "right"
        if self.total % 2 == 1:
            position = "left"
        description = photo.description.replace("\n", " ")
        photolatex = self.replace(photolatex, [("!position!", position),
                                               ("!photo-path!", os.path.split(photo.photo.path)[1]),
                                               ("!photo-title!", photo.title),
                                               ("!photo-description!", description)])
        self.total += 1
        self.placetotal += 1
        # avoid too many floats error
        # thrown at 36 with morefloats package
        if self.placetotal > 35:
            photolatex += "\clearpage"
            self.placetotal = 0
        self.content += photolatex

    def replace(self, target, rules):
        for placeholder, content in rules:
            if self.LATEX_ESCAPE.match(placeholder):
                content = content.encode("latex_bracket")
#                content = self.replace(content, [("ä", "\"ae"),
#                                                 ("Ä", "\"Ae"),
#                                                 ("ö", "\"oe"),
#                                                 ("Ö", "\"Oe"),
#                                                 ("ü", "\"ue"),
#                                                 ("Ü", "\"Ue"),
#                                                 ("ß", "ss"),
#                                                 ("€", " Euro"),
#                                                 ("m²", " Quadratmeter")])
            target = target.replace(placeholder, content)
        return target

if __name__ == "__main__":
    album = Album.objects.get(pk = 1)
    LatexExport(album)
