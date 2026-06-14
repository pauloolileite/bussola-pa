from rest_framework.routers import DefaultRouter
from .views import PasseioViewSet, PontoTuristicoViewSet

router = DefaultRouter()
router.register('passeios', PasseioViewSet)
router.register('pontos-turisticos', PontoTuristicoViewSet)

urlpatterns = router.urls