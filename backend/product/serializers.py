from rest_framework import serializers
from .models import Product, ProductImage


class ProductSerializer(serializers.ModelSerializer):

    # (1) 複数の画像を受け取るための「窓口」
    # write_only=True で、データベースには保存しない (読み取り時には使わない)
    # required=False で、画像が無くてもエラーにしない
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )

    class Meta:
        model = Product
        fields = ["id", "product_name", "ingredients_list", "price", "uploaded_images"]

    # (2) create メソッドを上書き（オーバーライド）する
    def create(self, validated_data):
        # validated_data から 'uploaded_images' を取り除く
        # (Product モデルには 'uploaded_images' というフィールドは無いため)
        uploaded_images = validated_data.pop("uploaded_images", [])

        # まず Product 本体を作成する
        product = Product.objects.create(**validated_data)

        # (3) 取り出した画像リストをループ処理
        # そして、ProductImage オブジェクトを1つずつ作成する
        for image in uploaded_images:
            ProductImage.objects.create(product=product, content=image)

        return product
