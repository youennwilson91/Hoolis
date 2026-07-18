from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_siteconfig_bg_fit'),
    ]

    operations = [
        migrations.AddField(
            model_name='siteconfig',
            name='bg_padding_top',
            field=models.IntegerField(default=0, verbose_name='Padding haut (px)'),
        ),
        migrations.AddField(
            model_name='siteconfig',
            name='bg_padding_bottom',
            field=models.IntegerField(default=0, verbose_name='Padding bas (px)'),
        ),
        migrations.AddField(
            model_name='siteconfig',
            name='bg_padding_left',
            field=models.IntegerField(default=0, verbose_name='Padding gauche (px)'),
        ),
        migrations.AddField(
            model_name='siteconfig',
            name='bg_padding_right',
            field=models.IntegerField(default=0, verbose_name='Padding droite (px)'),
        ),
    ]
