from django.shortcuts import render
from rest_framework.response import Response
from .serializers import ContactsSerializer
from rest_framework import status
from rest_framework.views import APIView
# Create your views here.
class ContactsInputView(APIView):
    def post(self,request):
        serializer = ContactsSerializer(data=request.data)
        if serializer.is_valid():
            text_data=serializer.validated_data['text']
            serializer.save()
            return Response({
                'message': '成功しました',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST)