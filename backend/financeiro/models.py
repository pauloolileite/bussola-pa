from django.db import models
from reservas.models import Reserva

class Financeiro(models.Model):
    STATUS_CHOICES = [
        ('pendente', 'Pendente'),
        ('pago', 'Pago'),
        ('cancelado', 'Cancelado'),
    ]
    reserva = models.OneToOneField(Reserva, on_delete=models.CASCADE, related_name='financeiro')
    valor_total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    valor_guia = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status_pagamento = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pendente')

    def __str__(self):
        return f'Financeiro - Reserva #{self.reserva.id}'