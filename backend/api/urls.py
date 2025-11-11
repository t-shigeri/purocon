from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import ItemViewSet
from .views import ExternalAPIConfigViewSet,ColumnMappingViewSet,ProductImportViewSet,ProductViewSet
router = DefaultRouter()
router.register(r'items', ItemViewSet)
router.register(r'external-api-configs', ExternalAPIConfigViewSet, basename='external-api-config')
router.register(r'column-mappings', ColumnMappingViewSet, basename='column-mapping')
router.register(r'product-import', ProductImportViewSet, basename='product-import')
router.register(r'products', ProductViewSet, basename='product')

urlpatterns = [
    path('', include(router.urls)),
]
