from django.db import models
from Skin.models import Skin_type

# Create your models here.


class Ingredients(models.Model):
    INGREDIENTS_NAME = models.CharField(max_length=40, primary_key=True)
    COMMENT = models.TextField()

    def __str__(self) -> str:
        return self.INGREDIENTS_NAME


class appropriate(models.Model):
    appropriate = models.BooleanField(null=True)
    INGREDIENTS_NAME = models.ForeignKey(Ingredients, on_delete=models.CASCADE)
    type_name = models.ForeignKey(Skin_type, on_delete=models.CASCADE)


class ProductName(models.Model):
    name = models.CharField(max_length=30)
    ingredients = models.ManyToManyField(Ingredients, blank=True)