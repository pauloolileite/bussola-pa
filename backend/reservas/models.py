import uuid
from django.db import models
from usuarios.models import Usuario, Cliente
from passeios.models import Passeio

class Reserva(models.Model):
    STATUS_CHOICES = [
        ('solicitada', 'Solicitada'),
        ('confirmada', 'Confirmada'),
        ('em_andamento', 'Em Andamento'),
        ('concluida', 'Concluída'),
        ('cancelada', 'Cancelada'),
    ]
    cliente = models.ForeignKey(Cliente, on_delete=models.PROTECT)
    passeio = models.ForeignKey(Passeio, on_delete=models.PROTECT)
    guia_responsavel = models.ForeignKey(Usuario, on_delete=models.PROTECT, related_name='reservas_responsavel')
    guias_apoio = models.ManyToManyField(Usuario, blank=True, related_name='reservas_apoio')
    data_reserva = models.DateField()
    horario_reserva = models.TimeField()
    quantidade_turistas = models.IntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='solicitada')
    observacoes = models.TextField(blank=True)
    codigo_qr = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'#{self.id} - {self.cliente} - {self.passeio}'
    
class ReservaHistorico(models.Model):
    reserva = models.ForeignKey(Reserva, on_delete=models.CASCADE, related_name='historico')
    status_anterior = models.CharField(max_length=20)
    status_novo = models.CharField(max_length=20)
    usuario = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True)
    observacao = models.TextField(blank=True)
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Reserva #{self.reserva.id}: {self.status_anterior} → {self.status_novo}'