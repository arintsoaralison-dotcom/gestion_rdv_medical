from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from .models import RendezVous
from .serializers import RendezVousSerializer


class RendezVousViewSet(viewsets.ModelViewSet):
    serializer_class = RendezVousSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'PATIENT':
            return RendezVous.objects.filter(patient__utilisateur=user)
        elif user.role == 'MEDECIN':
            return RendezVous.objects.filter(medecin__utilisateur=user)
        return RendezVous.objects.all()

    def perform_create(self, serializer):
        serializer.save(patient=self.request.user.patient)

    def perform_update(self, serializer):
        user = self.request.user
        nouveau_statut = serializer.validated_data.get('statut')

        if user.role == 'PATIENT' and nouveau_statut and nouveau_statut != 'ANNULE':
            raise PermissionDenied("Un patient ne peut qu'annuler un rendez-vous, pas changer son statut.")

        serializer.save()