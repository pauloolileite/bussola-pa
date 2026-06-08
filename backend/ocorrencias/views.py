from rest_framework import viewsets, permissions
from .models import Ocorrencia
from .serializers import OcorrenciaSerializer

class IsGuiaOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.perfil in ['admin', 'guia']

class OcorrenciaViewSet(viewsets.ModelViewSet):
    serializer_class = OcorrenciaSerializer
    permission_classes = [IsGuiaOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.perfil == 'admin':
            return Ocorrencia.objects.all()
        return Ocorrencia.objects.filter(usuario=user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)