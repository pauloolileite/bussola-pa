from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from usuarios.tokens import CustomTokenSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

class CustomTokenView(TokenObtainPairView):
    serializer_class = CustomTokenSerializer

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', CustomTokenView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include('usuarios.urls')),
    path('api/', include('passeios.urls')),
    path('api/', include('reservas.urls')),
    path('api/', include('ocorrencias.urls')),
    path('api/', include('financeiro.urls')),
]