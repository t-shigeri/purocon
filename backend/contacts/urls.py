from django.urls import path
from .views import ContactsInputView
 
urlpatterns = [
    path("text/", ContactsInputView.as_view(), name="Contacts"),
]