from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from core.permissions import IsAdmin, IsAdminOrGuia
from .models import Usuario, Cliente
from .serializers import UsuarioSerializer, UsuarioCriacaoSerializer, ClienteSerializer


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()

    def get_permissions(self):
        # Princípio do menor privilégio:
        # - LISTAR/VER (GET): admin e guia. O guia precisa da lista de guias
        #   para escolher responsável e apoio numa reserva (UC04/UC05).
        # - CRIAR/EDITAR/EXCLUIR: somente admin (gestão de usuários é UC10).
        if self.action in ('list', 'retrieve'):
            return [IsAdminOrGuia()]
        return [IsAdmin()]

    def get_serializer_class(self):
        if self.action == 'create':
            return UsuarioCriacaoSerializer
        return UsuarioSerializer

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

    @action(detail=False, methods=['post'], url_path='limpar-inativos',
            permission_classes=[IsAdmin])
    def limpar_inativos(self, request):
        from django.core.management import call_command
        call_command('limpar_usuarios')
        return Response({'mensagem': 'Limpeza executada com sucesso.'})


class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [IsAdminOrGuia]