from rest_framework import serializers
from .models import Ocorrencia

EXTENSOES_PERMITIDAS = ('.jpg', '.jpeg', '.png', '.pdf')
TAMANHO_MAXIMO_MB = 10

class OcorrenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ocorrencia
        fields = '__all__'

        read_only_fields = ('usuario',)

    def validate_reserva(self, reserva):

        request = self.context.get('request')
        if request and request.user.perfil != 'admin':
            eh_responsavel = reserva.guia_responsavel_id == request.user.id
            eh_apoio = reserva.guias_apoio.filter(id=request.user.id).exists()
            if not (eh_responsavel or eh_apoio):
                raise serializers.ValidationError(
                    'Você só pode registrar ocorrências em reservas das quais participa.'
                )
        return reserva

    def validate(self, data):

        request = self.context.get('request')
        if self.instance and request and request.user.perfil != 'admin':
            reserva = self.instance.reserva
            eh_responsavel = reserva.guia_responsavel_id == request.user.id
            eh_apoio = reserva.guias_apoio.filter(id=request.user.id).exists()
            if not (eh_responsavel or eh_apoio):
                raise serializers.ValidationError(
                    'Você só pode alterar ocorrências de reservas das quais participa.'
                )
        return data

    def validate_anexo(self, arquivo):

        if not arquivo:
            return arquivo
        nome = (arquivo.name or '').lower()
        if not nome.endswith(EXTENSOES_PERMITIDAS):
            raise serializers.ValidationError(
                f'Tipo de arquivo não permitido. Use: {", ".join(EXTENSOES_PERMITIDAS)}.'
            )
        if arquivo.size > TAMANHO_MAXIMO_MB * 1024 * 1024:
            raise serializers.ValidationError(
                f'Arquivo muito grande. Tamanho máximo: {TAMANHO_MAXIMO_MB} MB.'
            )
        return arquivo