from rest_framework import serializers
from .models import Financeiro


class FinanceiroSerializer(serializers.ModelSerializer):
    passeio_nome = serializers.CharField(source='reserva.passeio.nome', read_only=True)
    data_reserva = serializers.DateField(source='reserva.data_reserva', read_only=True)

    class Meta:
        model = Financeiro
        fields = '__all__'

    def validate_reserva(self, reserva):
        request = self.context.get('request')
        if request and request.user.perfil != 'admin':
            if reserva.guia_responsavel_id != request.user.id:
                raise serializers.ValidationError(
                    'Você só pode gerenciar o financeiro das suas próprias reservas.'
                )
        return reserva
