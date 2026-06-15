from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from core.permissions import IsAdminOrGuia, IsAdminOrParceiro, IsAdmin
from django.db.models import Count, Sum
from rest_framework.permissions import IsAuthenticated
from usuarios.models import Cliente
from .models import Reserva, ReservaHistorico
from .serializers import ReservaSerializer, AtualizarStatusSerializer, ReservaHistoricoSerializer, SolicitacaoClienteSerializer
from .services import gerar_financeiro_da_reserva
from financeiro.models import Financeiro


class ReservaViewSet(viewsets.ModelViewSet):
    serializer_class = ReservaSerializer
    permission_classes = [IsAdminOrGuia]

    def get_queryset(self):
        user = self.request.user
        if user.perfil == 'admin':
            return Reserva.objects.all()
        if user.perfil == 'cliente':
            # O cliente vê apenas as próprias reservas (RF07).
            return Reserva.objects.filter(cliente__usuario=user)
        # O guia vê as reservas onde é responsável OU apoio (RN004 / UC05).
        return Reserva.objects.filter(
            Q(guia_responsavel=user) | Q(guias_apoio=user)
        ).distinct()

    def get_permissions(self):
        if self.action in ['buscar_por_qr', 'validar_qr']:
            return [IsAdminOrParceiro()]
        if self.action in ['solicitar', 'list', 'retrieve']:
            # Cliente pode solicitar e ver as próprias; guia/admin também acessam.
            return [IsAuthenticated()]
        return super().get_permissions()

    @action(detail=True, methods=['patch'], url_path='status')
    def atualizar_status(self, request, pk=None):
        reserva = self.get_object()
        serializer = AtualizarStatusSerializer(
            data=request.data,
            context={'status_atual': reserva.status}
        )
        serializer.is_valid(raise_exception=True)
        status_anterior = reserva.status
        reserva.status = serializer.validated_data['status']
        reserva.save()
        ReservaHistorico.objects.create(
            reserva=reserva,
            status_anterior=status_anterior,
            status_novo=reserva.status,
            usuario=request.user,
            observacao=serializer.validated_data.get('observacao', '')
        )
        # Quando a reserva é concluída, gera o registro financeiro (regra de negócio).
        if reserva.status == 'concluida':
            gerar_financeiro_da_reserva(reserva)
        return Response(ReservaSerializer(reserva).data)

    @action(detail=False, methods=['get'], url_path='qr/(?P<codigo>[^/.]+)')
    def buscar_por_qr(self, request, codigo=None):
        try:
            reserva = Reserva.objects.get(codigo_qr=codigo)
            return Response(ReservaSerializer(reserva).data)
        except Reserva.DoesNotExist:
            return Response({'erro': 'Reserva não encontrada.'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['patch'], url_path='validar/(?P<codigo>[^/.]+)')
    def validar_qr(self, request, codigo=None):
        try:
            reserva = Reserva.objects.get(codigo_qr=codigo)
        except Reserva.DoesNotExist:
            return Response({'erro': 'Reserva não encontrada.'}, status=status.HTTP_404_NOT_FOUND)

        # A guarita só valida reservas que o guia já CONFIRMOU.
        # Fluxo correto: solicitada -> confirmada -> (guarita) em_andamento -> concluida.
        # Isso respeita a máquina de estados (antes pulava de solicitada direto
        # para em_andamento, contradizendo a regra de transições).
        if reserva.status != 'confirmada':
            return Response(
                {'erro': 'Reserva não está apta para validação. É necessário que o guia confirme a reserva antes.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        status_anterior = reserva.status
        reserva.status = 'em_andamento'
        reserva.save()

        ReservaHistorico.objects.create(
            reserva=reserva,
            status_anterior=status_anterior,
            status_novo='em_andamento',
            usuario=request.user,
            observacao='Validado via QR code pelo parceiro operacional.'
        )
        return Response(ReservaSerializer(reserva).data)

    @action(detail=False, methods=['post'], url_path='solicitar',
            permission_classes=[IsAuthenticated])
    def solicitar(self, request):
        """Solicitação feita pelo próprio cliente (UC02 / HU002).
        Servidor define cliente, status='solicitada' e deixa guia em aberto."""
        if request.user.perfil != 'cliente':
            return Response(
                {'erro': 'Apenas clientes podem solicitar passeios por aqui.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Localiza o Cliente vinculado ao usuário logado.
        cliente = Cliente.objects.filter(usuario=request.user).first()
        if not cliente:
            return Response(
                {'erro': 'Seu cadastro de cliente não foi encontrado. Contate o suporte.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # RN002: no máximo 3 reservas ativas por cliente.
        ativas = Reserva.objects.filter(
            cliente=cliente,
            status__in=['solicitada', 'confirmada', 'em_andamento'],
        ).count()
        if ativas >= 3:
            return Response(
                {'erro': 'Você já possui 3 solicitações ativas. Conclua ou cancele uma para solicitar outra. (RN002)'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = SolicitacaoClienteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # Servidor controla cliente e status; guia fica nulo até a confirmação.
        reserva = serializer.save(
            cliente=cliente,
            status='solicitada',
            guia_responsavel=None,
        )
        ReservaHistorico.objects.create(
            reserva=reserva,
            status_anterior='',
            status_novo='solicitada',
            usuario=request.user,
            observacao='Solicitação criada pelo cliente.',
        )
        return Response(ReservaSerializer(reserva).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='relatorio',
            permission_classes=[IsAdmin])
    def relatorio(self, request):
        """Relatório gerencial (UC14 / RN011). Apenas admin.
        Filtro opcional: ?inicio=YYYY-MM-DD&fim=YYYY-MM-DD"""
        reservas = Reserva.objects.all()
        inicio = request.query_params.get('inicio')
        fim = request.query_params.get('fim')
        if inicio:
            reservas = reservas.filter(data_reserva__gte=inicio)
        if fim:
            reservas = reservas.filter(data_reserva__lte=fim)

        total = reservas.count()
        por_status_raw = reservas.values('status').annotate(qtd=Count('id'))
        por_status = {item['status']: item['qtd'] for item in por_status_raw}

        receita = (
            Financeiro.objects.filter(reserva__in=reservas)
            .aggregate(total=Sum('valor_total'))['total'] or 0
        )
        concluidas = por_status.get('concluida', 0)
        ticket_medio = (float(receita) / concluidas) if concluidas else 0

        top_passeios_raw = (
            reservas.values('passeio__nome')
            .annotate(qtd=Count('id'))
            .order_by('-qtd')[:5]
        )
        top_passeios = [
            {'passeio': item['passeio__nome'], 'quantidade': item['qtd']}
            for item in top_passeios_raw
        ]

        return Response({
            'total_reservas': total,
            'por_status': por_status,
            'receita_total': float(receita),
            'ticket_medio': round(ticket_medio, 2),
            'top_passeios': top_passeios,
        })

    @action(detail=True, methods=['get'], url_path='historico')
    def historico(self, request, pk=None):
        reserva = self.get_object()
        historico = ReservaHistorico.objects.filter(reserva=reserva)
        return Response(ReservaHistoricoSerializer(historico, many=True).data)
