from rest_framework.routers import DefaultRouter
from .views import FinanceiroViewSet

router = DefaultRouter()
router.register('financeiro', FinanceiroViewSet, basename='financeiro')

urlpatterns = router.urls