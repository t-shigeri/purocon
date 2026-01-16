from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
# メイン側で 'api/products/' を指定するため、ここではプレフィックスを r'' にします
router.register(r"", views.ProductViewSet, basename="product")

urlpatterns = [
    path("", include(router.urls)),
]
