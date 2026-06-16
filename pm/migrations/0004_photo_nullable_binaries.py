from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pm', '0003_demo_user'),
    ]

    operations = [
        migrations.AlterField(
            model_name='photo',
            name='photo',
            field=models.BinaryField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='photo',
            name='thumb',
            field=models.BinaryField(blank=True, null=True),
        ),
    ]
