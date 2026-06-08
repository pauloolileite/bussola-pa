from django.db import models

class PontoTuristico(models.Model):
    nome = models.CharField(max_length=200)
    descricao = models.TextField(blank=True)
    localizacao = models.CharField(max_length=300, blank=True)
    status = models.BooleanField(default=True)

    def __str__(self):
        return self.nome

class Passeio(models.Model):
    CATEGORIA_CHOICES = [
        ('catamara', 'Catamarã'),
        ('lancha', 'Lancha'),
        ('voadeira', 'Voadeira'),
        ('ecoturismo', 'Ecoturismo'),
        ('aventura', 'Aventura'),
    ]
    TIPO_VALOR_CHOICES = [
        ('fixo', 'Valor Fixo'),
        ('consultar', 'A Consultar'),
    ]
    nome = models.CharField(max_length=200)
    descricao = models.TextField(blank=True)
    categoria = models.CharField(max_length=20, choices=CATEGORIA_CHOICES)
    tipo_valor = models.CharField(max_length=10, choices=TIPO_VALOR_CHOICES, default='fixo')
    valor = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status = models.BooleanField(default=True)
    ponto_turistico = models.ForeignKey(PontoTuristico, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.nome