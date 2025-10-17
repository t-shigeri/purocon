# accounts/urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    # (Optional but recommended) This path is for refreshing tokens later
    path("login/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
