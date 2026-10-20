from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    InscriptionView,
    CustomTokenObtainPairView,
    MonProfilView,
    UtilisateurViewSet,
    ReinitialiserMotDePasseView,
)

router = DefaultRouter()
router.register('utilisateurs', UtilisateurViewSet, basename='utilisateur')

urlpatterns = [
    path('inscription/', InscriptionView.as_view(), name='inscription'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('login/refresh/', TokenRefreshView.as_view(), name='login_refresh'),
    path('mon-profil/', MonProfilView.as_view(), name='mon_profil'),
    path('reinitialiser-mot-de-passe/', ReinitialiserMotDePasseView.as_view(), name='reinitialiser_mot_de_passe'),
] + router.urls