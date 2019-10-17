from django.conf import settings
from django.db import migrations

from pm.migrations import create_user


def combine_names(apps, schema_editor):
    create_user(apps, settings.DEMO_USER_EMAIL,
                settings.DEMO_USER_PASSWORD, 'Demo', 'Keiken')


class Migration(migrations.Migration):

    dependencies = [
        ('pm', '0002_test_user'),
    ]

    operations = [
        migrations.RunPython(combine_names),
    ]
