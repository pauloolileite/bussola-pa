from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from core.permissions import IsAdmin, IsAdminOrGuia
from .models import Usuario, Cliente
from .serializers import (
    UsuarioSerializer, UsuarioCriacaoSerializer, ClienteSerializer,
    RegistroClienteSerializer,
)


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()

    def get_permissions(self):
        # Auto-cadastro de cliente é público (qualquer visitante).
        if self.action == 'registrar':
            return [AllowAny()]
        # Listar/ver: admin e guia. Criar/editar/excluir: só admin.
        if self.action in ('list', 'retrieve'):
            return [IsAdminOrGuia()]
        return [IsAdmin()]

    def get_serializer_class(self):
        if self.action == 'registrar':
            return RegistroClienteSerializer
        if self.action == 'create':
            return UsuarioCriacaoSerializer
        return UsuarioSerializer

    @action(detail=False, methods=['post'], url_path='registrar')
    def registrar(self, request):
        """Endpoint público de auto-cadastro de cliente (tela de login)."""
        serializer = RegistroClienteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {'mensagem': 'Conta criada com sucesso.'},
            status=status.HTTP_201_CREATED,
        )

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        instance = self.get_object()
        if 'status' in request.data:
            if request.data['status'] in [False, 'false', 'False']:
                instance.desativar()
            else:
                instance.ativar()
            return Response(UsuarioSerializer(instance).data)
        return self.update(request, *args, **kwargs)


class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [IsAdminOrGuia]
