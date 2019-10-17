from django.conf import settings
from django.db import migrations

from pm.migrations import create_user


def combine_names(apps, schema_editor):
    create_user(apps, settings.TEST_USER_EMAIL,
                settings.TEST_USER_PASSWORD, 'Test', 'Keiken')


class Migration(migrations.Migration):

    dependencies = [
        ('pm', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(combine_names),
    ]
