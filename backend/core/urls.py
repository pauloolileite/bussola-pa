from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView
from usuarios.tokens import CustomTokenSerializer


class CustomTokenView(TokenObtainPairView):
    serializer_class = CustomTokenSerializer
    # Liga o limite de tentativas (5 por minuto) só na tela de login.
    # Protege contra ataque de força bruta (tentar senhas em massa).
    throttle_scope = 'login'


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', CustomTokenView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include('usuarios.urls')),
    path('api/', include('passeios.urls')),
    path('api/', include('reservas.urls')),
    path('api/', include('ocorrencias.urls')),
    path('api/', include('financeiro.urls')),
    path('api/ia/', include('ia.urls')),
]

# Em desenvolvimento, serve os arquivos enviados (anexos de ocorrências).
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
