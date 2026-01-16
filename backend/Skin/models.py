from django.db import models
 
# Create your models here.
class Skin_type(models.Model):
    type_name=models.CharField(max_length=10,primary_key=True)
    def __str__(self):
        return self.type_name