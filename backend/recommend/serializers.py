from rest_framework import serializers
from .models import Ingredients
 
class IngredientsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredients
        fields = ["id","INGREDIENTS_NAME",'COMMENT']