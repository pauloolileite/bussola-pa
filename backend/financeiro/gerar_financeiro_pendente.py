"""
Gera o registro financeiro para reservas que JÁ estão concluídas mas
ainda não têm financeiro (situação anterior à automação).

Uso:  python manage.py gerar_financeiro_pendente
"""
from django.core.management.base import BaseCommand
from reservas.models import Reserva
from reservas.services import gerar_financeiro_da_reserva


class Command(BaseCommand):
    help = 'Cria o financeiro das reservas concluídas que ainda não possuem um.'

    def handle(self, *args, **kwargs):
        concluidas = Reserva.objects.filter(status='concluida', financeiro__isnull=True)
        total = concluidas.count()
        for reserva in concluidas:
            gerar_financeiro_da_reserva(reserva)
        self.stdout.write(
            self.style.SUCCESS(f'{total} registro(s) financeiro(s) gerado(s).')
        )
