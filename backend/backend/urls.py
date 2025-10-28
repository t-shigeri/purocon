"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from backend import views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r"admin/users", views.UserAdminViewSet, basename="admin-user")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("api.urls")),
    path("contacts/", include("contacts.urls")),
    path("api/accounts/", include("accounts.urls")),
    path("api/", include(router.urls)),  # GET /api/admin/users/, POST /api/
    # 認証関連のURL
    path(
        "api/auth/password/change/",
        views.PasswordChangeView.as_view(),
        name="password_change",
    ),  # PUT /api/auth/password/change/
    # ... (例: path('api/auth/', include('djoser.urls.jwt')), ) ...
]
