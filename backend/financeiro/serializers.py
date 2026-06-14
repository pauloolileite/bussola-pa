from rest_framework import serializers
from .models import Financeiro

class FinanceiroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Financeiro
        fields = '__all__'