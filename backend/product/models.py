from django.db import models
from django.utils import timezone


# Create your models here.
class Product(models.Model):  # 商品モデル
    product_name = models.CharField(max_length=100, verbose_name="商品名")
    ingredients_list = models.TextField(verbose_name="成分表")
    price = models.IntegerField(verbose_name="価格")

    def images(self):
        return ProductImage.objects.filter(product=self.id).order_by("dt")


class ProductImage(models.Model):

    # 【変更点 1】 ProductモデルへのForeignKeyを追加
    # これにより、この画像がどの Product に紐付いているかを定義します
    product = models.ForeignKey(Product, verbose_name="商品", on_delete=models.CASCADE)

    # 【変更点 2】 投稿日時 (dt) フィールドを追加
    # Product.images メソッドで order_by("dt") を使うために必要です
    dt = models.DateTimeField(verbose_name="投稿日時", default=timezone.now)

    # フィールド名は 'icontent' でも 'content' でも問題ありません
    content = models.ImageField(
        verbose_name="画像", upload_to="bbs/product_image/content"
    )

    def __str__(self):
        # 管理画面などで見やすくするため（任意）
        return f"{self.product.product_name} の画像"


class Access(models.Model):
    # 【命名規則】 'product_id' -> 'product'
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        verbose_name="商品",  # 管理画面用に verbose_name を追加
    )

    # 【改善】 フィールド名をより具体的に (access -> access_count)
    # 【改善】 default=0 を設定し、初期値を0にする
    access_count = models.IntegerField(verbose_name="アクセス数", default=0)

    def __str__(self):
        # 管理画面で見やすくする
        return f"{self.product.product_name} のアクセス: {self.access_count}回"
