from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario, Cliente

@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Perfil Bússola PA', {'fields': ('perfil', 'telefone', 'status')}),
    )

admin.site.register(Cliente)