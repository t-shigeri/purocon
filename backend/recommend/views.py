from django.shortcuts import render

from requests import request
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Ingredients,appropriate
from django.db.models import Prefetch
# Create your views here.
@api_view(['POST'])
def returndata(request):
    data1 = request.data.get('data1')
    data2 = request.data.get('data2')
    data3 = request.data.get('data3')

    appropriate_filtered = appropriate.objects.filter(
        appropriate=True,
        type_name=data2
    ).select_related('INGREDIENTS_NAME', 'type_name')
    
    ingredient_names = appropriate_filtered.values_list(
        'INGREDIENTS_NAME_id', 
        flat=True
    ).distinct()
    
    recommends = Ingredients.objects.filter(
        INGREDIENTS_NAME__in=ingredient_names
    )

    recommend_list = [
        {
            'name': ing.INGREDIENTS_NAME,
            'comment': ing.COMMENT
        }
        for ing in recommends
    ]
    
    return Response({
        'result': data1,
        'recommends': recommend_list
    })