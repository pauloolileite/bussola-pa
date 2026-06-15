from rest_framework import serializers
from .models import Financeiro


class FinanceiroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Financeiro
        fields = '__all__'

    def validate_reserva(self, reserva):
        """Segurança de posse (RN009): um guia só pode lançar/editar o
        financeiro de reservas das quais ele é o responsável. O admin pode tudo.
        A checagem fica no serializer para valer tanto na criação quanto na edição."""
        request = self.context.get('request')
        if request and request.user.perfil != 'admin':
            if reserva.guia_responsavel_id != request.user.id:
                raise serializers.ValidationError(
                    'Você só pode gerenciar o financeiro das suas próprias reservas.'
                )
        return reserva
