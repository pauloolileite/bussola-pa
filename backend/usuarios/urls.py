from rest_framework.routers import DefaultRouter
from .views import UsuarioViewSet, ClienteViewSet

router = DefaultRouter()
router.register('usuarios', UsuarioViewSet)
router.register('clientes', ClienteViewSet)

urlpatterns = router.urls