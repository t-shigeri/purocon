from rest_framework import generics, permissions, viewsets, status
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import PasswordChangeSerializer, UserAdminSerializer
from .permissions import IsSuperUser  # ステップ1で作成

User = get_user_model()


# --- 1. 自分のパスワード変更用 ---
class PasswordChangeView(generics.UpdateAPIView):
    """
    ログイン中のユーザーが自身のパスワードを変更する
    (PUTリクエストで old_password, new_password1, new_password2 を受け取る)
    """

    serializer_class = PasswordChangeSerializer
    permission_classes = [permissions.IsAuthenticated]  # ログイン必須

    def get_object(self):
        # 更新対象は常にリクエストしてきたユーザー自身
        return self.request.user

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "パスワードが正常に変更されました。"}, status=status.HTTP_200_OK
        )


# --- 2. 管理者によるユーザー管理 (CRUD) 用 ---
class UserAdminViewSet(viewsets.ModelViewSet):
    """
    スーパー管理者による他の管理者アカウントのCRUD
    """

    serializer_class = UserAdminSerializer
    # ステップ1で作成した「スーパー管理者のみ」の権限を適用
    permission_classes = [IsSuperUser]

    def get_queryset(self):
        # 操作対象をスタッフ (is_staff=True) のみに限定する
        # (スーパー管理者自身も含まれる)
        return User.objects.filter(is_staff=True)
