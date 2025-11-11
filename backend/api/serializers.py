from rest_framework import serializers
from .models import Item
from product.models import Product,ProductImage
from rest_framework import serializers
from .models import ExternalAPIConfig, ColumnMapping, ProductImportLog




class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = '__all__'


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'dt']


class ProductSerializer(serializers.ModelSerializer):
    product_images = ProductImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = ['id', 'product_name', 'ingredients_list', 'price', 'product_images', 'created_at', 'updated_at']


class ColumnMappingSerializer(serializers.ModelSerializer):
    internal_column_display = serializers.CharField(source='get_internal_column_display', read_only=True)
    
    class Meta:
        model = ColumnMapping
        fields = [
            'id', 
            'internal_column', 
            'internal_column_display',
            'external_column', 
            'json_path',
            'transformation_rule'
        ]


class ExternalAPIConfigSerializer(serializers.ModelSerializer):
    column_mappings = ColumnMappingSerializer(many=True, read_only=True)
    
    class Meta:
        model = ExternalAPIConfig
        fields = [
            'id', 
            'store_name', 
            'api_url', 
            'api_key', 
            'is_active',
            'sample_data',
            'column_mappings',
            'created_at', 
            'updated_at'
        ]
        extra_kwargs = {
            'api_key': {'write_only': True}  # セキュリティのためAPIキーは書き込み専用
        }


class ExternalAPIConfigListSerializer(serializers.ModelSerializer):
    """リスト表示用(APIキーを隠す)"""
    mappings_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ExternalAPIConfig
        fields = [
            'id', 
            'store_name', 
            'api_url', 
            'is_active',
            'mappings_count',
            'created_at'
        ]
    
    def get_mappings_count(self, obj):
        return obj.column_mappings.count()


class APITestRequestSerializer(serializers.Serializer):
    """API接続テスト用"""
    api_url = serializers.URLField(required=True)
    api_key = serializers.CharField(required=True, max_length=500)


class ColumnMappingCreateSerializer(serializers.Serializer):
    """カラムマッピング一括作成用"""
    api_config_id = serializers.IntegerField(required=True)
    mappings = serializers.ListField(
        child=serializers.DictField(),
        required=True
    )


class ProductImportLogSerializer(serializers.ModelSerializer):
    api_config_name = serializers.CharField(source='api_config.store_name', read_only=True)
    
    class Meta:
        model = ProductImportLog
        fields = [
            'id',
            'api_config',
            'api_config_name',
            'status',
            'total_count',
            'success_count',
            'failed_count',
            'error_message',
            'created_at'
        ]
