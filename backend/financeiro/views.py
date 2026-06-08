from rest_framework import viewsets, permissions
from .models import Financeiro
from .serializers import FinanceiroSerializer

class IsGuiaOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.perfil in ['admin', 'guia']

class FinanceiroViewSet(viewsets.ModelViewSet):
    serializer_class = FinanceiroSerializer
    permission_classes = [IsGuiaOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.perfil == 'admin':
            return Financeiro.objects.all()
        return Financeiro.objects.filter(reserva__guia_responsavel=user)