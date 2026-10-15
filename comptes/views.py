from rest_framework import generics, permissions, viewsets
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import Utilisateur
from .serializers import (
    UtilisateurSerializer,
    UtilisateurGestionSerializer,
    MonProfilSerializer,
    CustomTokenObtainPairSerializer,
)
from .permissions import EstAdmin


class InscriptionView(generics.CreateAPIView):
    """Inscription publique : toujours créée avec le rôle PATIENT, quoi qu'on envoie."""
    queryset = Utilisateur.objects.all()
    serializer_class = UtilisateurSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        serializer.save(role=Utilisateur.Role.PATIENT)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class MonProfilView(generics.RetrieveUpdateAPIView):
    """Permet à n'importe quel utilisateur connecté de voir/modifier son propre compte."""
    serializer_class = MonProfilSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class UtilisateurViewSet(viewsets.ModelViewSet):
    """Gestion des comptes, réservée à l'administrateur."""
    permission_classes = [EstAdmin]

    def get_serializer_class(self):
        if self.action == 'create':
            return UtilisateurSerializer
        return UtilisateurGestionSerializer

    def get_queryset(self):
        queryset = Utilisateur.objects.all().order_by('username')
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role)
        return queryset