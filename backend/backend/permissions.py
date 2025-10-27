from rest_framework import permissions


class IsSuperUser(permissions.BasePermission):
    """
    スーパーユーザー (is_superuser=True) のみアクセスを許可する
    """

    def has_permission(self, request, view):
        # 認証済みであり、かつスーパーユーザーであるかをチェック
        return (
            request.user and request.user.is_authenticated and request.user.is_superuser
        )
