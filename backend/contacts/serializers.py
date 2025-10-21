from rest_framework import serializers
from .models import Contacts
 
class ContactsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contacts
        fields = ["id","text",'created_at']