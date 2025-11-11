from rest_framework import viewsets
from .models import Item
from .serializers import ItemSerializer

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
import requests
import json
from typing import Dict, Any, List
from product.models import Product,ProductImage
from .models import ExternalAPIConfig,ColumnMapping,ProductImportLog

from .serializers import ProductSerializer,ExternalAPIConfigSerializer,ExternalAPIConfigListSerializer,ColumnMappingSerializer,APITestRequestSerializer,ColumnMappingCreateSerializer,ProductImportLogSerializer




class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer

class ExternalAPIConfigViewSet(viewsets.ModelViewSet):
    """外部API設定の管理"""
    queryset = ExternalAPIConfig.objects.all()
    permission_classes = [IsAuthenticated]
 
    def get_serializer_class(self):
        if self.action == 'list':
            return ExternalAPIConfigListSerializer
        return ExternalAPIConfigSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['post'])
    def test_connection(self, request):

        """
        外部APIへの接続テスト
        POST /api/external-api-configs/test_connection/
        {
            "api_url": "https://example.com/api/products",
            "api_key": "your-api-key"
        }
        """

        serializer = APITestRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'error': 'Invalid request data', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        api_url = serializer.validated_data['api_url']
        api_key = serializer.validated_data['api_key']
        
        try:
            # APIリクエストを送信
            headers = {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            }
            
            response = requests.get(api_url, headers=headers, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            # サンプルデータを解析してカラム情報を抽出
            columns = self._extract_columns(data)
            
            return Response({
                'success': True,
                'message': 'API接続成功',
                'sample_data': data,
                'detected_columns': columns,
                'status_code': response.status_code
            })
            
        except requests.exceptions.Timeout:
            return Response(
                {'error': 'API接続がタイムアウトしました'},
                status=status.HTTP_408_REQUEST_TIMEOUT
            )
        except requests.exceptions.ConnectionError:
            return Response(
                {'error': 'APIサーバーに接続できません'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except requests.exceptions.HTTPError as e:
            return Response(
                {'error': f'HTTPエラー: {e.response.status_code}', 'details': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except json.JSONDecodeError:
            return Response(
                {'error': 'APIレスポンスがJSON形式ではありません'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': 'API接続エラー', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _extract_columns(self, data: Any, prefix: str = '') -> List[Dict[str, Any]]:
        """
        JSONデータからカラム情報を再帰的に抽出
        """
        columns = []
        
        # データが配列の場合、最初の要素を使用
        if isinstance(data, list) and len(data) > 0:
            data = data[0]
            prefix = prefix + '[0].' if prefix else '[0].'
        
        if isinstance(data, dict):
            for key, value in data.items():
                current_path = f"{prefix}{key}" if prefix else key
                
                # 値の型を判定
                value_type = type(value).__name__
                sample_value = value
                
                if isinstance(value, (dict, list)):
                    # ネストされたオブジェクトの場合、再帰的に処理
                    columns.append({
                        'column_name': key,
                        'json_path': current_path,
                        'type': value_type,
                        'sample_value': str(value)[:100] + ('...' if len(str(value)) > 100 else ''),
                        'is_nested': True
                    })
                    # ネストされた要素も展開
                    nested_columns = self._extract_columns(value, current_path + '.')
                    columns.extend(nested_columns)
                else:
                    columns.append({
                        'column_name': key,
                        'json_path': current_path,
                        'type': value_type,
                        'sample_value': sample_value,
                        'is_nested': False
                    })
        
        return columns
    
    @action(detail=True, methods=['get'])
    def columns(self, request, pk=None):
        """
        保存済みAPI設定のカラム情報を取得
        GET /api/external-api-configs/{id}/columns/
        """
        api_config = self.get_object()
        
        if not api_config.sample_data:
            return Response(
                {'error': 'サンプルデータがありません。まず接続テストを実行してください。'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        columns = self._extract_columns(api_config.sample_data)
        
        return Response({
            'api_config_id': api_config.id,
            'store_name': api_config.store_name,
            'columns': columns
        })


class ColumnMappingViewSet(viewsets.ModelViewSet):
    """カラムマッピングの管理"""
    queryset = ColumnMapping.objects.all()
    serializer_class = ColumnMappingSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        api_config_id = self.request.query_params.get('api_config_id')
        if api_config_id:
            queryset = queryset.filter(api_config_id=api_config_id)
        return queryset
    
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """
        カラムマッピングを一括作成
        POST /api/column-mappings/bulk_create/
        {
            "api_config_id": 1,
            "mappings": [
                {
                    "internal_column": "product_name",
                    "external_column": "name",
                    "json_path": "data.products[0].name",
                    "transformation_rule": "none"
                },
                ...
            ]
        }
        """
        serializer = ColumnMappingCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        api_config_id = serializer.validated_data['api_config_id']
        mappings_data = serializer.validated_data['mappings']
        
        try:
            api_config = ExternalAPIConfig.objects.get(id=api_config_id)
        except ExternalAPIConfig.DoesNotExist:
            return Response(
                {'error': 'API設定が見つかりません'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        with transaction.atomic():
            # 既存のマッピングを削除
            ColumnMapping.objects.filter(api_config=api_config).delete()
            
            # 新しいマッピングを作成
            created_mappings = []
            for mapping_data in mappings_data:
                mapping = ColumnMapping.objects.create(
                    api_config=api_config,
                    internal_column=mapping_data.get('internal_column'),
                    external_column=mapping_data.get('external_column'),
                    json_path=mapping_data.get('json_path', ''),
                    transformation_rule=mapping_data.get('transformation_rule', 'none')
                )
                created_mappings.append(mapping)
        
        serializer = ColumnMappingSerializer(created_mappings, many=True)
        return Response({
            'success': True,
            'message': f'{len(created_mappings)}件のマッピングを作成しました',
            'mappings': serializer.data
        }, status=status.HTTP_201_CREATED)


class ProductImportViewSet(viewsets.ReadOnlyModelViewSet):
    """商品インポート実行とログ管理"""
    queryset = ProductImportLog.objects.all()
    serializer_class = ProductImportLogSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def execute(self, request):
        """
        外部APIから商品データをインポート
        POST /api/product-import/execute/
        {
            "api_config_id": 1
        }
        """
        api_config_id = request.data.get('api_config_id')
        
        if not api_config_id:
            return Response(
                {'error': 'api_config_idが必要です'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            api_config = ExternalAPIConfig.objects.get(id=api_config_id, is_active=True)
        except ExternalAPIConfig.DoesNotExist:
            return Response(
                {'error': 'API設定が見つからないか、無効です'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # マッピングがあるか確認
        mappings = ColumnMapping.objects.filter(api_config=api_config)
        if not mappings.exists():
            return Response(
                {'error': 'カラムマッピングが設定されていません'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # インポートログを作成
        import_log = ProductImportLog.objects.create(
            api_config=api_config,
            status='pending'
        )
        
        try:
            # 外部APIからデータを取得
            headers = {
                'Authorization': f'Bearer {api_config.api_key}',
                'Content-Type': 'application/json'
            }
            
            response = requests.get(api_config.api_url, headers=headers, timeout=30)
            response.raise_for_status()
            external_data = response.json()
            
            # データをインポート
            result = self._import_products(api_config, mappings, external_data)
            
            # ログを更新
            import_log.total_count = result['total']
            import_log.success_count = result['success']
            import_log.failed_count = result['failed']
            import_log.status = 'success' if result['failed'] == 0 else 'partial'
            import_log.error_message = result.get('error_message', '')
            import_log.save()
            
            return Response({
                'success': True,
                'message': 'インポートが完了しました',
                'result': result,
                'log_id': import_log.id
            })
            
        except Exception as e:
            import_log.status = 'failed'
            import_log.error_message = str(e)
            import_log.save()
            
            return Response(
                {'error': 'インポート中にエラーが発生しました', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _import_products(self, api_config, mappings, external_data):
        """商品データをインポート"""
        result = {
            'total': 0,
            'success': 0,
            'failed': 0,
            'errors': []
        }
        
        # マッピング情報を辞書に変換
        mapping_dict = {
            mapping.internal_column: {
                'external_column': mapping.external_column,
                'json_path': mapping.json_path,
                'transformation_rule': mapping.transformation_rule
            }
            for mapping in mappings
        }
        
        # データが配列かどうかを判定
        products_data = external_data
        if isinstance(external_data, dict):
            # ネストされている場合、最初の配列を探す
            for value in external_data.values():
                if isinstance(value, list):
                    products_data = value
                    break
        
        if not isinstance(products_data, list):
            products_data = [products_data]
        
        result['total'] = len(products_data)
        
        for item in products_data:
            try:
                # マッピングに基づいてデータを抽出
                product_data = {}
                for internal_col, mapping_info in mapping_dict.items():
                    value = self._extract_value(
                        item, 
                        mapping_info['json_path'] or mapping_info['external_column'],
                        mapping_info['transformation_rule']
                    )
                    
                    if internal_col != 'image_url':  # 画像は別処理
                        product_data[internal_col] = value
                
                # 商品を作成または更新
                product, created = Product.objects.update_or_create(
                    product_name=product_data.get('product_name'),
                    defaults=product_data
                )
                
                result['success'] += 1
                
            except Exception as e:
                result['failed'] += 1
                result['errors'].append({
                    'item': item,
                    'error': str(e)
                })
        
        return result
    
    def _extract_value(self, data: Dict, path: str, transformation_rule: str = 'none'):
        """JSONパスから値を抽出"""
        keys = path.split('.')
        value = data
        
        for key in keys:
            # 配列インデックスの処理 (例: items[0])
            if '[' in key and ']' in key:
                key_name = key.split('[')[0]
                index = int(key.split('[')[1].split(']')[0])
                value = value.get(key_name, [])[index]
            else:
                value = value.get(key) if isinstance(value, dict) else None
            
            if value is None:
                break
        
        # データ変換
        if transformation_rule == 'to_int' and value:
            value = int(value)
        elif transformation_rule == 'to_float' and value:
            value = float(value)
        elif transformation_rule == 'join_array' and isinstance(value, list):
            value = ', '.join(str(v) for v in value)
        
        return value


class ProductViewSet(viewsets.ModelViewSet):
    """商品管理"""
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]