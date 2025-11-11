from rest_framework import serializers
from .models import Product, ProductImage

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["id", "content"]

class ProductListSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(
        many=True, read_only=True, source="productimage_set"
    )


    class Meta:
        model = Product
        fields = ["id", "product_name", "price", "images", "ingredients_list"]

class ProductCreateSerializer(serializers.ModelSerializer):

    uploaded_images = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )

    class Meta:
        model = Product
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


class ProductUpdateSerializer(serializers.ModelSerializer):

    uploaded_images = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )

    images_to_delete = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )

    class Meta:
        model = Product
        fields = [
            "id",
            "product_name",
            "ingredients_list",
            "price",
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
