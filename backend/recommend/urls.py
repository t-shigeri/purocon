from django.urls import path

from .views import returndata
urlpatterns = [
    path("return/", returndata, name="return"),
]