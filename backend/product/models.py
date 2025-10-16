from django.db import models

# Create your models here.
class Product(models.Model):  # 商品モデル
    Product_name = models.CharField(max_length=40)
    Ingredients_List = models.CharField(max_length=30)
    Price = models.IntegerField()
    barcode = models.ImageField()

class Access(models.Model):  # モデル（商品ごとのアクセス数を数える）
    Product_id = models.ForeignKey(Product,on_delete=models.CASCADE)  # 商品名（外部キー）
    access = models.IntegerField()
