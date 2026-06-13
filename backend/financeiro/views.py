from rest_framework import viewsets
from core.permissions import IsAdminOrGuia
from .models import Financeiro
from .serializers import FinanceiroSerializer


class FinanceiroViewSet(viewsets.ModelViewSet):
    serializer_class = FinanceiroSerializer
    permission_classes = [IsAdminOrGuia]

    def get_queryset(self):
        user = self.request.user
        if user.perfil == 'admin':
            return Financeiro.objects.all()
        return Financeiro.objects.filter(reserva__guia_responsavel=user)