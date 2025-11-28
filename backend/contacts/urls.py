from django.urls import path
from .views import ContactsInputView
 
urlpatterns = [
    path("return/", ContactsInputView.as_view(), name="Contacts"),
]
