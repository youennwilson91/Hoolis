from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    email = models.EmailField(unique=True)

    def __str__(self):
        return self.username


class SiteConfig(models.Model):
    bg_image_desktop = models.ImageField(upload_to='site/', blank=True)
    bg_image_mobile = models.ImageField(upload_to='site/', blank=True)

    class Meta:
        verbose_name = "Configuration du site"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
