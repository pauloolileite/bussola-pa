from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from core.permissions import IsAdminOrGuia, IsAdminOrParceiro
from .models import Reserva, ReservaHistorico
from .serializers import ReservaSerializer, AtualizarStatusSerializer, ReservaHistoricoSerializer


class ReservaViewSet(viewsets.ModelViewSet):
    serializer_class = ReservaSerializer
    permission_classes = [IsAdminOrGuia]

    def get_queryset(self):
        user = self.request.user
        if user.perfil == 'admin':
            return Reserva.objects.all()
        return Reserva.objects.filter(guia_responsavel=user)

    def get_permissions(self):
        if self.action in ['buscar_por_qr', 'validar_qr']:
            return [IsAdminOrParceiro()]
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

        if reserva.status not in ['solicitada', 'confirmada']:
            return Response(
                {'erro': 'Reserva não está apta para validação.'},
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

    @action(detail=True, methods=['get'], url_path='historico')
    def historico(self, request, pk=None):
        reserva = self.get_object()
        historico = ReservaHistorico.objects.filter(reserva=reserva)
        return Response(ReservaHistoricoSerializer(historico, many=True).data)