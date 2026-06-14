from rest_framework import serializers
from .models import Passeio, PontoTuristico

class PontoTuristicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PontoTuristico
        fields = '__all__'

class PasseioSerializer(serializers.ModelSerializer):
    ponto_turistico_nome = serializers.CharField(source='ponto_turistico.nome', read_only=True)

    class Meta:
        model = Passeio
        fields = '__all__'