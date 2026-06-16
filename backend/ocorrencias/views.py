from rest_framework import viewsets
from django.db.models import Q
from core.permissions import IsAdminOrGuia
from .models import Ocorrencia
from .serializers import OcorrenciaSerializer


class OcorrenciaViewSet(viewsets.ModelViewSet):
    serializer_class = OcorrenciaSerializer
    permission_classes = [IsAdminOrGuia]

    def get_queryset(self):
        user = self.request.user
        if user.perfil == 'admin':
            return Ocorrencia.objects.all()
        return Ocorrencia.objects.filter(
            Q(usuario=user)
            | Q(reserva__guia_responsavel=user)
            | Q(reserva__guias_apoio=user)
        ).distinct()

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)
