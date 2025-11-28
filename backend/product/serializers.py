from rest_framework import serializers
from .models import Product, ProductImage


# --- (1) 新規追加: 画像表示用のSerializer ---
# ProductImageモデルのデータをJSONに変換します（主にURLを渡すため）
class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        # 'content' フィールド（ImageField）が画像のURLに変換されます
        fields = ["id", "content"]


# --- (2) 新規追加: 商品「一覧表示」用のSerializer (Read-Only) ---
# 読み取り専用のシンプルなSerializer
class ProductListSerializer(serializers.ModelSerializer):

    # (A) 関連する画像を取得するための設定
    # 'productimage_set' は、ProductImageモデルからProductモデルへの
    # 逆参照名です。(もし related_name='images' などと設定していれば、それを指定します)
    # source='...' を使うと、JSONのキー名を 'images' に指定できます。
    images = ProductImageSerializer(
        many=True, read_only=True, source="productimage_set"
    )

    # (B) (オプション) 最初の画像だけを返す場合
    # first_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        # 一覧に必要な最小限のフィールドを指定します
        fields = ["id", "product_name", "price", "images", "ingredients_list"]
        # (例: 'ingredients_list' はデータが重いので一覧からは除外)

    # (B) の SerializerMethodField を使う場合のメソッド
    # def get_first_image(self, obj):
    #     first_image = obj.productimage_set.first()
    #     if first_image:
    #         # リクエストのコンテキストを使って完全なURLを生成
    #         request = self.context.get('request')
    #         return request.build_absolute_uri(first_image.content.url)
    #     return None


# --- (3) 変更: 元のSerializerを「新規作成」用としてリネーム ---
# これは書き込み(Create)専用として使います
class ProductCreateSerializer(serializers.ModelSerializer):

    # 複数の画像を受け取るための「窓口」
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )

    class Meta:
        model = Product
        # 'uploaded_images' を含める
        fields = [
            "id",
            "product_name",
            "ingredients_list",
            "price",
            "uploaded_images",
        ]

    # create メソッドを上書き
    def create(self, validated_data):
        uploaded_images = validated_data.pop("uploaded_images", [])
        product = Product.objects.create(**validated_data)
        for image in uploaded_images:
            ProductImage.objects.create(product=product, content=image)
        return product


# --- (4) (オプション)「更新」用のSerializer ---
# 更新時は「画像を追加」はあっても「全とっかえ」は少ないため、
# createとは別のロジックが必要な場合が多いです。
# (ここでは簡単な例として定義)
class ProductUpdateSerializer(serializers.ModelSerializer):

    # (1) 新規画像追加用の「窓口」 (Create と同じ)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )

    # (2) 削除したい画像のIDリストを受け取る「窓口」
    images_to_delete = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )

    class Meta:
        model = Product
        # uploaded_images は含めない（別途、画像追加/削除APIを作るのが一般的）
        fields = [
            "id",
            "product_name",
            "ingredients_list",
            "price",
            # write_only のフィールド
            "uploaded_images",
            "images_to_delete",
        ]

        # (3) update メソッドを上書き（オーバーライド）

    def update(self, instance, validated_data):

        # (A) 先に画像リストを取り出す
        uploaded_images = validated_data.pop("uploaded_images", [])
        images_to_delete_ids = validated_data.pop("images_to_delete", [])

        # (B) 残った text データを親の update メソッドで更新
        #     (validated_data に残っているものだけが更新される)
        instance = super().update(instance, validated_data)

        # (C) 削除対象の画像を削除
        if images_to_delete_ids:
            # (セキュリティのため、この商品 'instance' に紐づく画像だけを削除対象にする)
            ProductImage.objects.filter(
                product=instance, id__in=images_to_delete_ids
            ).delete()

        # (D) 新規追加の画像を登録 (Create と同じ)
        for image in uploaded_images:
            ProductImage.objects.create(product=instance, content=image)

        instance.save()
        return instance
