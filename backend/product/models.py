from django.db import models
from django.utils import timezone


# Create your models here.
class Product(models.Model):
    product_name = models.CharField(max_length=100, verbose_name="商品名")
    ingredients_list = models.TextField(verbose_name="成分表", blank=True, null=True)
    price = models.IntegerField(verbose_name="価格")

    def images(self):
        return ProductImage.objects.filter(product=self.id).order_by("dt")


class ProductImage(models.Model):
    product = models.ForeignKey(Product, verbose_name="商品", on_delete=models.CASCADE)
    dt = models.DateTimeField(verbose_name="投稿日時", default=timezone.now)
    content = models.ImageField(
        verbose_name="画像", upload_to="bbs/product_image/content"
    )

    def __str__(self):
        return f"{self.product.product_name} の画像"


class Access(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        verbose_name="商品",  
    )
    access_count = models.IntegerField(verbose_name="アクセス数", default=0)

    def __str__(self):
        return f"{self.product.product_name} のアクセス: {self.access_count}回"
    
