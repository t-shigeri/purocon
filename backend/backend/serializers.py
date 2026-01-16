from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


# --- 1. 自分のパスワード変更用 ---
class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(
        required=True, write_only=True, label="現在のパスワード"
    )
    new_password1 = serializers.CharField(
        required=True, write_only=True, label="新しいパスワード"
    )
    new_password2 = serializers.CharField(
        required=True, write_only=True, label="新しいパスワード（確認）"
    )

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("現在のパスワードが正しくありません。")
        return value

    def validate(self, data):
        if data["new_password1"] != data["new_password2"]:
            raise serializers.ValidationError("新しいパスワードが一致しません。")
        return data

    def save(self, **kwargs):
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password1"])
        user.save()
        return user


# --- 2. 管理者によるユーザー管理 (CRUD) 用 ---
class UserAdminSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=False,  # 必須ではない (更新時は空でもOK)
        style={"input_type": "password"},
        label="パスワード",
    )

    class Meta:
        model = User
        # is_staff=True の管理者のみを操作対象とする想定
        fields = ["id", "username", "email", "is_staff", "is_superuser", "password"]
        read_only_fields = ["id"]
        # passwordは読み取り(GET)時には返さない
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        # パスワードをハッシュ化してユーザーを作成
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
            is_staff=validated_data.get("is_staff", True),  # デフォルトでスタッフにする
            is_superuser=validated_data.get("is_superuser", False),
        )
        return user

    def update(self, instance, validated_data):
        # password がリクエストに含まれているかチェック
        password = validated_data.pop("password", None)

        # 親クラスの update で他のフィールドを更新
        instance = super().update(instance, validated_data)

        if password:
            # パスワードが入力されていた場合のみ、ハッシュ化して設定
            instance.set_password(password)
            instance.save()

        return instance
