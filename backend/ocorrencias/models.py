from django.db import models
from usuarios.models import Usuario
from reservas.models import Reserva

class Ocorrencia(models.Model):
    STATUS_CHOICES = [
        ('aberta', 'Aberta'),
        ('em_analise', 'Em Análise'),
        ('resolvida', 'Resolvida'),
    ]
    reserva = models.ForeignKey(Reserva, on_delete=models.CASCADE, related_name='ocorrencias')
    usuario = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True)
    descricao = models.TextField()
    data_ocorrencia = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='aberta')
    anexo = models.FileField(upload_to='ocorrencias/', null=True, blank=True)

    def __str__(self):
        return f'Ocorrência #{self.id} - Reserva #{self.reserva.id}'