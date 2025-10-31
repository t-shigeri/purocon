# product/views.py

from rest_framework import viewsets
from rest_framework.parsers import (
    MultiPartParser,
    FormParser,
)  # (1) 画像アップロードのために追加
from .models import Product

# (2) 前回作成したSerializerをすべてインポート
from .serializers import (
    ProductListSerializer,
    ProductCreateSerializer,
    ProductUpdateSerializer,  # (更新用も前回定義したと仮定)
)


class ProductViewSet(viewsets.ModelViewSet):
    """
    商品を一覧・作成・更新・削除するための API ビュー
    """

    queryset = Product.objects.all().order_by("-id")

    # (3) デフォルトのSerializerを指定 (主に 'retrieve' (詳細表示) で使われる)
    serializer_class = ProductListSerializer

    # (4) 画像やファイルを含むフォームデータを受け取れるようにする
    parser_classes = [MultiPartParser, FormParser]

    # (5) アクション(操作)に応じてSerializerを動的に切り替える
    def get_serializer_class(self):

        # 'create' アクション (POSTリクエスト) の場合
        if self.action == "create":
            return ProductCreateSerializer

        # 'update', 'partial_update' アクション (PUT, PATCHリクエスト) の場合
        if self.action in ["update", "partial_update"]:
            return ProductUpdateSerializer

        # 'list' (一覧) や 'retrieve' (詳細) アクション (GETリクエスト) の場合
        # デフォルトの serializer_class (ProductListSerializer) を使用
        return self.serializer_class
