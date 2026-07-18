from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    email = models.EmailField(unique=True)

    def __str__(self):
        return self.username


class SiteConfig(models.Model):
    class ImageFit(models.TextChoices):
        COVER   = 'cover',   'Couvrir (recadrage)'
        CONTAIN = 'contain', 'Contenir (image entière)'
        FILL    = 'fill',    'Étirer (remplit tout)'
        CENTER  = 'none',    'Taille réelle'

    bg_image_desktop = models.ImageField(upload_to='site/', blank=True)
    bg_image_mobile  = models.ImageField(upload_to='site/', blank=True)
    bg_fit           = models.CharField(
        max_length=10,
        choices=ImageFit.choices,
        default=ImageFit.COVER,
        verbose_name="Ajustement de l'image"
    )
    bg_padding_top    = models.IntegerField(default=0, verbose_name="Padding haut (px)")
    bg_padding_bottom = models.IntegerField(default=0, verbose_name="Padding bas (px)")
    bg_padding_left   = models.IntegerField(default=0, verbose_name="Padding gauche (px)")
    bg_padding_right  = models.IntegerField(default=0, verbose_name="Padding droite (px)")

    class Meta:
        verbose_name = "Configuration du site"

    def __str__(self):
        return "Configuration du site"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
