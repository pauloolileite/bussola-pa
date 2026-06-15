from rest_framework import serializers
from .models import Reserva, ReservaHistorico
from usuarios.models import Usuario

TRANSICOES_VALIDAS = {
    'solicitada': ['confirmada', 'cancelada'],
    'confirmada': ['em_andamento', 'cancelada'],
    'em_andamento': ['concluida', 'cancelada'],
    'concluida': [],
    'cancelada': [],
}


class ReservaSerializer(serializers.ModelSerializer):
    passeio_nome = serializers.CharField(source='passeio.nome', read_only=True)
    cliente_nome = serializers.CharField(source='cliente.nome', read_only=True)
    guia_nome = serializers.CharField(source='guia_responsavel.get_full_name', read_only=True)
    # Lista somente-leitura com os nomes dos guias de apoio, para exibir na tela.
    # O campo guias_apoio (ids) continua existindo via __all__ para gravação.
    guias_apoio_nomes = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Reserva
        fields = '__all__'

    def get_guias_apoio_nomes(self, obj):
        return [
            {'id': g.id, 'nome': g.get_full_name() or g.username}
            for g in obj.guias_apoio.all()
        ]

    def validate(self, data):
        cliente = data.get('cliente')
        instance = self.instance
        if not instance:
            ativas = Reserva.objects.filter(
                cliente=cliente,
                status__in=['solicitada', 'confirmada', 'em_andamento']
            ).count()
            if ativas >= 3:
                raise serializers.ValidationError('Cliente já possui 3 reservas ativas. (RN002)')
        if not data.get('guia_responsavel'):
            raise serializers.ValidationError('Guia responsável é obrigatório. (RN003)')

        # RN004: um guia de apoio não pode ser o mesmo que o guia responsável.
        responsavel = data.get('guia_responsavel') or getattr(instance, 'guia_responsavel', None)
        apoios = data.get('guias_apoio')
        if apoios and responsavel and responsavel in apoios:
            raise serializers.ValidationError(
                'O guia responsável não pode também ser guia de apoio. (RN004)'
            )
        return data


class AtualizarStatusSerializer(serializers.Serializer):
    status = serializers.CharField()
    observacao = serializers.CharField(required=False, allow_blank=True)

    def validate_status(self, novo_status):
        status_atual = self.context['status_atual']
        permitidos = TRANSICOES_VALIDAS.get(status_atual, [])
        if novo_status not in permitidos:
            raise serializers.ValidationError(f'Transição inválida: {status_atual} → {novo_status}. (MSG016)')
        return novo_status


class ReservaHistoricoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReservaHistorico
        fields = '__all__'
