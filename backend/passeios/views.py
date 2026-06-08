from rest_framework import viewsets, permissions
from django_filters.rest_framework import DjangoFilterBackend
from .models import Passeio, PontoTuristico
from .serializers import PasseioSerializer, PontoTuristicoSerializer

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.perfil == 'admin'

class PasseioViewSet(viewsets.ModelViewSet):
    queryset = Passeio.objects.filter(status=True)
    serializer_class = PasseioSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['categoria', 'tipo_valor']

class PontoTuristicoViewSet(viewsets.ModelViewSet):
    queryset = PontoTuristico.objects.filter(status=True)
    serializer_class = PontoTuristicoSerializer
    permission_classes = [IsAdminOrReadOnly]