from django.urls import path
from .views import IngredientsView
 
urlpatterns = [
    path("ingredients/", IngredientsView.as_view(), name="Contacts"),
]