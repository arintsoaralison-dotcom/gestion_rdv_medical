from rest_framework import viewsets, permissions
from rest_framework.exceptions import ValidationError
from django.db.models import Q
from .models import Medecin, Specialite, Disponibilite
from .serializers import MedecinSerializer, SpecialiteSerializer, DisponibiliteSerializer
from comptes.permissions import EstAdmin, EstAdminOuProprietaire


class SpecialiteViewSet(viewsets.ModelViewSet):
    queryset = Specialite.objects.all()
    serializer_class = SpecialiteSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [EstAdmin()]
        return [permissions.AllowAny()]


class MedecinViewSet(viewsets.ModelViewSet):
    serializer_class = MedecinSerializer

    def get_queryset(self):
        queryset = Medecin.objects.select_related('utilisateur', 'specialite').all()
        specialite_id = self.request.query_params.get('specialite')
        recherche = self.request.query_params.get('recherche')

        if specialite_id:
            queryset = queryset.filter(specialite_id=specialite_id)

        if recherche:
            queryset = queryset.filter(
                Q(utilisateur__last_name__icontains=recherche) |
                Q(utilisateur__first_name__icontains=recherche) |
                Q(specialite__nom__icontains=recherche)
            )

        return queryset

    def get_permissions(self):
        if self.action in ['create', 'destroy']:
            return [EstAdmin()]
        if self.action in ['update', 'partial_update']:
            return [EstAdminOuProprietaire()]
        return [permissions.AllowAny()]


class DisponibiliteViewSet(viewsets.ModelViewSet):
    serializer_class = DisponibiliteSerializer

    def get_queryset(self):
        queryset = Disponibilite.objects.select_related('medecin').all()
        medecin_id = self.request.query_params.get('medecin')
        user = self.request.user

        if medecin_id:
            queryset = queryset.filter(medecin_id=medecin_id)
        elif user.is_authenticated and user.role == 'MEDECIN':
            queryset = queryset.filter(medecin=user.medecin)

        return queryset

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'MEDECIN':
            try:
                medecin = user.medecin
            except Medecin.DoesNotExist:
                raise ValidationError(
                    "Aucune fiche médecin n'est liée à ton compte. "
                    "Demande à un administrateur de la créer."
                )
            serializer.save(medecin=medecin)
        else:
            if not serializer.validated_data.get('medecin'):
                raise ValidationError({'medecin': 'Ce champ est obligatoire.'})
            serializer.save()