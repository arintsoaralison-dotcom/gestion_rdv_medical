from rest_framework.routers import DefaultRouter
from .views import MedecinViewSet, SpecialiteViewSet, DisponibiliteViewSet

router = DefaultRouter()
router.register('medecins', MedecinViewSet, basename='medecin')
router.register('specialites', SpecialiteViewSet)
router.register('disponibilites', DisponibiliteViewSet, basename='disponibilite')

urlpatterns = router.urls