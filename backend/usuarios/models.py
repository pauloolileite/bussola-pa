from django.contrib.auth.models import AbstractUser
from django.db import models

class Usuario(AbstractUser):
    PERFIL_CHOICES = [
        ('admin', 'Administrador'),
        ('guia', 'Guia de Turismo'),
        ('parceiro', 'Parceiro Operacional'),
        ('cliente', 'Cliente'),
    ]
    perfil = models.CharField(max_length=20, choices=PERFIL_CHOICES, default='cliente')
    telefone = models.CharField(max_length=20, blank=True)
    status = models.BooleanField(default=True)

    def __str__(self):
        return f'{self.get_full_name()} ({self.perfil})'

class Cliente(models.Model):
    nome = models.CharField(max_length=200)
    telefone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    observacoes = models.TextField(blank=True)
    usuario = models.OneToOneField(Usuario, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.nome