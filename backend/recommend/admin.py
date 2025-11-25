from django.contrib import admin
from .models import Ingredients,appropriate,ProductName


class IngredientsAdmin(admin.ModelAdmin):

    list_display = ("INGREDIENTS_NAME", "_num_of_product")

    # _num_of_product: 講義を履修している学生人数
    def _num_of_product(self, obj):
        return len(ProductName.objects.filter(ingredients=obj))


class ProductNameAdmin(admin.ModelAdmin):
    list_display = ("name", "_product")

    # 履修中の講義名を ", " 区切りで連結
    def _product(self, obj):
        return ', '.join(lec.INGREDIENTS_NAME for lec in obj.ingredients.all())




# Register your models here.
admin.site.register(Ingredients,IngredientsAdmin)
admin.site.register(appropriate)
admin.site.register(ProductName, ProductNameAdmin)