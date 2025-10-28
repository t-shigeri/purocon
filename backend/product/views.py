from django.shortcuts import render

# Create your views here.
# product/views.py

from rest_framework import viewsets
from .models import Product
from .serializers import ProductSerializer


class ProductViewSet(viewsets.ModelViewSet):
    """
    商品を一覧・作成・更新・削除するための API ビュー
    """

    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    # (補足) 実際に複数枚の画像を *受け取って* 保存するには、
    # .create() メソッドなどをオーバーライドして、
    # request.FILES から画像データを手動で処理するロジックが
    # 必要になることが多いです。
