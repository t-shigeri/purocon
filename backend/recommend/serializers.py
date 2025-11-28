from rest_framework import serializers
from .models import Ingredients,appropriate

 
class QuestionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contacts
        fields = ["id","text",'created_at']