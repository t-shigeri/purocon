from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(["GET"])
def hello(request):
    data = {"message": "川久保4ね"}
    return Response(data)

