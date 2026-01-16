from django.contrib import admin
from .models import Product, ProductImage, Access


# (1) ProductImage を「インライン（= 商品ページに組み込む形）」で
#     表示するための設定クラスを作成します。
#     admin.TabularInline はテーブル（表）形式で表示する設定です。
class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1  # デフォルトで1つ、空のアップロード欄を表示（3にすれば3つ出ます）


# (2) Product の管理ページをカスタマイズするための設定クラスを作成します。
class ProductAdmin(admin.ModelAdmin):
    # (3) 「inlines」設定に、先ほど作成した ProductImageInline を指定します。
    #     これにより、Product の編集ページに ProductImage が組み込まれます。
    inlines = [ProductImageInline]


# --- 登録処理の変更 ---

# (4) Product は、カスタマイズした ProductAdmin を使って登録します。
admin.site.register(Product, ProductAdmin)

# (5) ProductImage は ProductAdmin に組み込まれたため、
#     個別に admin.site.register する必要はなくなりました（むしろ二重登録になるので消します）
# admin.site.register(ProductImage)  <-- この行は削除するかコメントアウト

# (6) Access は通常通り登録します。
admin.site.register(Access)
