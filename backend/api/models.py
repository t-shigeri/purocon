from django.db import models
from django.conf import settings
import json


class Item(models.Model):
    name = models.CharField(max_length=100)
    detail = models.TextField()

    def __str__(self):
        return self.name

class ExternalAPIConfig(models.Model):
    """外部API設定モデル"""
    store_name = models.CharField(max_length=200, verbose_name="店舗名")
    api_url = models.URLField(verbose_name="APIエンドポイントURL")
    api_key = models.CharField(max_length=500, verbose_name="APIキー")
    is_active = models.BooleanField(default=True, verbose_name="有効")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        verbose_name="作成者"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="作成日時")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新日時")
    
    # サンプルデータを保存(カラム名取得用)
    sample_data = models.JSONField(
        blank=True, 
        null=True, 
        verbose_name="サンプルデータ",
        help_text="外部APIから取得したサンプルデータ"
    )
    
    def __str__(self):
        return f"{self.store_name} - {self.api_url}"

    class Meta:
        verbose_name = "外部API設定"
        verbose_name_plural = "外部API設定"


class ColumnMapping(models.Model):
    """カラムマッピングモデル - 外部APIのカラムと内部DBのカラムを紐付け"""
    
    # 内部DBのカラム名(固定)
    INTERNAL_COLUMN_CHOICES = [
        ('product_name', '商品名'),
        ('ingredients_list', '成分表'),
        ('price', '価格'),
        ('image_url', '画像URL'),
    ]
    
    api_config = models.ForeignKey(
        ExternalAPIConfig, 
        on_delete=models.CASCADE, 
        related_name='column_mappings',
        verbose_name="API設定"
    )
    
    # 内部システムのカラム名
    internal_column = models.CharField(
        max_length=100, 
        choices=INTERNAL_COLUMN_CHOICES,
        verbose_name="内部カラム名"
    )
    
    # 外部APIのカラム名
    external_column = models.CharField(
        max_length=200, 
        verbose_name="外部カラム名",
        help_text="外部APIのレスポンスに含まれるカラム名"
    )
    
    # ネストされたJSONの場合のパス (例: "data.products.name")
    json_path = models.CharField(
        max_length=500, 
        blank=True, 
        null=True,
        verbose_name="JSONパス",
        help_text="ネストされたデータの場合のパス(例: data.items.0.name)"
    )
    
    # データ変換ルール(オプション)
    transformation_rule = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        choices=[
            ('none', '変換なし'),
            ('to_int', '整数に変換'),
            ('to_float', '小数に変換'),
            ('strip_html', 'HTMLタグ除去'),
            ('join_array', '配列を結合'),
        ],
        default='none',
        verbose_name="変換ルール"
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="作成日時")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新日時")

    def __str__(self):
        return f"{self.api_config.store_name}: {self.internal_column} <- {self.external_column}"

    class Meta:
        verbose_name = "カラムマッピング"
        verbose_name_plural = "カラムマッピング"
        unique_together = ['api_config', 'internal_column']


class ProductImportLog(models.Model):
    """商品インポートログ"""
    
    STATUS_CHOICES = [
        ('pending', '処理中'),
        ('success', '成功'),
        ('partial', '一部成功'),
        ('failed', '失敗'),
    ]
    
    api_config = models.ForeignKey(
        ExternalAPIConfig, 
        on_delete=models.CASCADE,
        verbose_name="API設定"
    )
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='pending',
        verbose_name="ステータス"
    )
    total_count = models.IntegerField(default=0, verbose_name="総件数")
    success_count = models.IntegerField(default=0, verbose_name="成功件数")
    failed_count = models.IntegerField(default=0, verbose_name="失敗件数")
    error_message = models.TextField(blank=True, null=True, verbose_name="エラーメッセージ")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="実行日時")
    
    def __str__(self):
        return f"{self.api_config.store_name} - {self.created_at} ({self.status})"

    class Meta:
        verbose_name = "インポートログ"
        verbose_name_plural = "インポートログ"
        ordering = ['-created_at']
