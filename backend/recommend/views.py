from django.shortcuts import render
from rest_framework.response import Response
from .serializers import IngredientsSerializer
from rest_framework import status
# Create your views here.
from rest_framework.views import APIView
# Create your views here.
class IngredientsView(APIView):
    def post(self,request):
        serializer = IngredientsSerializer(data=request.data)
        if serializer.is_valid():
            INGREDIENTS_NAME=serializer.validated_data['INGREDIENTS_NAME']
            COMMENT=serializer.validated_data['COMMENT']
            serializer.save()
            return Response({
                'message': '成功しました',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST)