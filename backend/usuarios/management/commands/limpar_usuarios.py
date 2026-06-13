from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from usuarios.models import Usuario

class Command(BaseCommand):
    help = 'Remove usuários inativos há mais de 180 dias'

    def handle(self, *args, **kwargs):
        limite = timezone.now() - timedelta(days=180)
        inativos = Usuario.objects.filter(
            status=False,
            desativado_em__lte=limite
        )
        total = inativos.count()
        inativos.delete()
        self.stdout.write(
            self.style.SUCCESS(f'{total} usuário(s) removido(s) automaticamente.')
        )