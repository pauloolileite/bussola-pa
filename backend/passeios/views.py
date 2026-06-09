from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import AllowAny
from core.permissions import IsAdmin
from .models import Passeio, PontoTuristico
from .serializers import PasseioSerializer, PontoTuristicoSerializer


class PasseioViewSet(viewsets.ModelViewSet):
    queryset = Passeio.objects.filter(status=True)
    serializer_class = PasseioSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['categoria', 'tipo_valor']

    def get_permissions(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return [AllowAny()]
        return [IsAdmin()]


class PontoTuristicoViewSet(viewsets.ModelViewSet):
    queryset = PontoTuristico.objects.filter(status=True)
    serializer_class = PontoTuristicoSerializer

    def get_permissions(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return [AllowAny()]
        return [IsAdmin()]