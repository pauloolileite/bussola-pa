from rest_framework import serializers
from .models import Usuario, Cliente


class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'perfil', 'telefone', 'status']


class UsuarioCriacaoSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Usuario
        fields = ['username', 'first_name', 'last_name', 'email', 'password', 'perfil', 'telefone']

    def create(self, validated_data):
        password = validated_data.pop('password')
        usuario = Usuario(**validated_data)
        usuario.set_password(password)
        usuario.save()
        return usuario


class RegistroClienteSerializer(serializers.ModelSerializer):
    """Auto-cadastro pela tela de login (RN001 / UC02).
    SEGURANÇA: o perfil é SEMPRE 'cliente' — qualquer perfil enviado na
    requisição é ignorado. Assim ninguém cria admin/guia por aqui."""
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = Usuario
        fields = ['username', 'first_name', 'email', 'password', 'telefone']

    def validate_username(self, valor):
        if Usuario.objects.filter(username=valor).exists():
            raise serializers.ValidationError('Este nome de usuário já está em uso.')
        return valor

    def validate_email(self, valor):
        if valor and Usuario.objects.filter(email=valor).exists():
            raise serializers.ValidationError('Este e-mail já está cadastrado.')
        return valor

    def create(self, validated_data):
        password = validated_data.pop('password')
        usuario = Usuario(**validated_data)
        usuario.perfil = 'cliente'   # forçado, nunca vem do cliente
        usuario.status = True
        usuario.set_password(password)
        usuario.save()
        # Cria também o registro de Cliente vinculado (para reservas).
        Cliente.objects.create(
            nome=validated_data.get('first_name') or validated_data['username'],
            email=validated_data.get('email', ''),
            telefone=validated_data.get('telefone', ''),
            usuario=usuario,
        )
        return usuario


class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'
