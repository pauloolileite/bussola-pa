from decimal import Decimal
from financeiro.models import Financeiro


def gerar_financeiro_da_reserva(reserva):
    valor_passeio = reserva.passeio.valor if reserva.passeio.valor is not None else Decimal('0')

    financeiro, _criado = Financeiro.objects.get_or_create(
        reserva=reserva,
        defaults={
            'valor_total': valor_passeio,
            'valor_guia': Decimal('0'),
            'status_pagamento': 'pendente',
        },
    )
    return financeiro
