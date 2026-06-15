from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('reservas', '0002_reserva_codigo_qr'),
    ]

    operations = [
        migrations.AlterField(
            model_name='reserva',
            name='guia_responsavel',
            field=models.ForeignKey(
                blank=True, null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='reservas_responsavel',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
