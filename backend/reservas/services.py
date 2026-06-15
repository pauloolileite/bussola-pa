"""
Regras de negócio relacionadas a reservas.

Manter a lógica aqui (e não dentro das views) deixa cada parte com uma
responsabilidade só: a view cuida do HTTP, o service cuida da regra.
"""
from decimal import Decimal
from financeiro.models import Financeiro


def gerar_financeiro_da_reserva(reserva):
    """
    Cria (ou atualiza) o registro financeiro de uma reserva concluída.

    Regras definidas:
      - Disparado quando a reserva passa para 'concluida'.
      - valor_total = valor do passeio (fixo). Se o passeio for "A Consultar"
        ou não tiver valor, entra como 0 para o guia preencher depois.
      - valor_guia (comissão) = 0 por enquanto.

    Idempotente: se já existir financeiro para a reserva, não duplica.
    """
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
