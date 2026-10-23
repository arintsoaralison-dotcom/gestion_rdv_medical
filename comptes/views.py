from rest_framework import generics, permissions, viewsets
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import Utilisateur
from .serializers import (
    UtilisateurSerializer,
    InscriptionSerializer,
    UtilisateurGestionSerializer,
    MonProfilSerializer,
    CustomTokenObtainPairSerializer,
)
from .permissions import EstAdmin


class InscriptionView(generics.CreateAPIView):
    """Inscription publique : le rôle choisi ne peut être que PATIENT ou MEDECIN (jamais ADMIN)."""
    queryset = Utilisateur.objects.all()
    serializer_class = InscriptionSerializer
    permission_classes = [permissions.AllowAny]


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class MonProfilView(generics.RetrieveUpdateAPIView):
    """Permet à n'importe quel utilisateur connecté de voir/modifier son propre compte."""
    serializer_class = MonProfilSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ReinitialisationThrottle(AnonRateThrottle):
    scope = 'reinitialisation_mdp'
    rate = '5/hour'


class ReinitialiserMotDePasseView(APIView):
    """Mot de passe oublié : le nom d'utilisateur et l'e-mail doivent correspondre."""
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ReinitialisationThrottle]

    def post(self, request):
        username = str(request.data.get('username', '')).strip()
        email = str(request.data.get('email', '')).strip()
        nouveau = str(request.data.get('password', ''))

        erreur = Response(
            {'detail': "Ces informations ne correspondent à aucun compte."},
            status=400,
        )

        if not username or not email:
            return erreur

        utilisateur = (
            Utilisateur.objects
            .filter(username=username, email__iexact=email, is_active=True)
            .exclude(role=Utilisateur.Role.ADMIN)
            .first()
        )
        if utilisateur is None:
            return erreur

        try:
            validate_password(nouveau, utilisateur)
        except DjangoValidationError as e:
            return Response({'password': list(e.messages)}, status=400)

        utilisateur.set_password(nouveau)
        utilisateur.save()
        return Response({'detail': 'Mot de passe modifié.'})


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