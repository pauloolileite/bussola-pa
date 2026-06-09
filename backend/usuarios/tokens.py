from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers

class CustomTokenSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        if not self.user.status:
            raise serializers.ValidationError('Usuário inativo. Contate o administrador.')
        return data

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['perfil'] = user.perfil
        token['nome'] = user.get_full_name() or user.username
        return token