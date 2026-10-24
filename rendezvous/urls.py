from rest_framework.routers import DefaultRouter
from .views import RendezVousViewSet, NotificationViewSet

router = DefaultRouter()
router.register('rendezvous', RendezVousViewSet, basename='rendezvous')
router.register('notifications', NotificationViewSet, basename='notification')

urlpatterns = router.urls