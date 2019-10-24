import json
import os

from django.conf import settings
from django.contrib.auth.models import User
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from pm.models.album import Album
from pm.models.photo import Photo
from pm.models.place import Place
from pm.view.photo import create_thumb, get_size


def find_models(entities, model):
    return [entity for entity in entities if entity['model'] == model]


def find_photos(entites, json_place):
    photos = find_models(entites, 'pm.photo')
    return [photo for photo in photos if photo['fields']['place'] == json_place['pk']]


class Command(BaseCommand):
    help = 'Closes the specified poll for voting'

    def add_arguments(self, parser):
        parser.add_argument(
            'demo_dir', help='A directory that contains all photos and a json dump of the demo album')

    def handle(self, *args, **options):
        demo_dir = options['demo_dir']
        entities = None
        with open(os.path.join(demo_dir, "data.json")) as f:
            entities = json.load(f)

        albums = find_models(entities, 'pm.album')
        if len(albums) > 1:
            raise CommandError('Data contains more than one album')

        demo_user = User.objects.get(username=settings.DEMO_USER_EMAIL)

        if demo_user is None:
            raise CommandError('No demo user in db')

        existing_albums = Album.objects.filter(user=demo_user)
        if existing_albums:
            raise CommandError('Demo user already has an album')

        with transaction.atomic():
            json_album = albums[0]
            album = Album(lat=json_album['fields']['lat'], lon=json_album['fields']['lon'],
                          secret=json_album['fields']['secret'], password=json_album['fields']['password'],
                          title=json_album['fields']['title'], description=json_album['fields']['description'],
                          date=json_album['fields']['date'], user=demo_user)
            album.save()

            places = find_models(entities, 'pm.place')
            for json_place in places:
                place = Place(lat=json_place['fields']['lat'], lon=json_place['fields']['lon'],
                              title=json_place['fields']['title'], description=json_place['fields']['description'], date=json_place['fields']['date'], album=album)
                place.save()
                for json_photo in find_photos(entities, json_place):
                    photo_data, thumb_data = create_thumb(
                        open(os.path.join(demo_dir, '%d.jpeg' % (json_photo['pk'], )), 'rb'))
                    size = get_size(photo_data)
                    userprofile = demo_user.userprofile
                    userprofile.used_space += size
                    userprofile.save()

                    photo = Photo(order=json_photo['fields']['order'], date=json_photo['fields']['date'],
                                  photo=photo_data, thumb=thumb_data, size=size, title=json_photo['fields']['title'], description=json_photo['fields']['description'], place=place)
                    photo.save()
                    self.stdout.write('Imported photo %s' % (photo.title, ))
