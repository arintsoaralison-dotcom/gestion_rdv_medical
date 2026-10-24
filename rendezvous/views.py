from datetime import timedelta

from django.utils import timezone
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from .models import RendezVous, Notification
from .serializers import RendezVousSerializer, NotificationSerializer


def nom_patient(rdv):
    utilisateur = rdv.patient.utilisateur
    return utilisateur.get_full_name() or utilisateur.username


def generer_rappels(utilisateur):
    """Crée le rappel des rendez-vous confirmés d'aujourd'hui et de demain (une seule fois chacun)."""
    maintenant = timezone.localtime()
    aujourdhui = maintenant.date()
    demain = aujourdhui + timedelta(days=1)

    rendezvous = RendezVous.objects.filter(
        medecin__utilisateur=utilisateur,
        statut=RendezVous.Statut.CONFIRME,
        date__in=[aujourdhui, demain],
    ).select_related('patient__utilisateur')

    for rdv in rendezvous:
        # Rendez-vous d'aujourd'hui dont l'heure est déjà passée : inutile de rappeler
        if rdv.date == aujourdhui and rdv.heure < maintenant.time():
            continue
        quand = "demain" if rdv.date == demain else "aujourd'hui"
        Notification.objects.get_or_create(
            rendezvous=rdv,
            type=Notification.Type.RAPPEL,
            defaults={
                'utilisateur': utilisateur,
                'message': (
                    f"Rappel : vous avez un rendez-vous {quand} à "
                    f"{rdv.heure:%H:%M} avec {nom_patient(rdv)}."
                ),
            },
        )


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
        rdv = serializer.save(patient=self.request.user.patient)
        Notification.objects.create(
            utilisateur=rdv.medecin.utilisateur,
            rendezvous=rdv,
            type=Notification.Type.NOUVELLE_DEMANDE,
            message=(
                f"Nouvelle demande de rendez-vous de {nom_patient(rdv)} "
                f"le {rdv.date:%d/%m/%Y} à {rdv.heure:%H:%M}."
            ),
        )

    def perform_update(self, serializer):
        user = self.request.user
        nouveau_statut = serializer.validated_data.get('statut')

        if user.role == 'PATIENT' and nouveau_statut and nouveau_statut != 'ANNULE':
            raise PermissionDenied("Un patient ne peut qu'annuler un rendez-vous, pas changer son statut.")

        ancienne_date = serializer.instance.date
        ancienne_heure = serializer.instance.heure
        rdv = serializer.save()

        # Un rappel n'a de sens que pour un rendez-vous confirmé, à sa date et heure actuelles
        if (
            rdv.statut != RendezVous.Statut.CONFIRME
            or rdv.date != ancienne_date
            or rdv.heure != ancienne_heure
        ):
            Notification.objects.filter(rendezvous=rdv, type=Notification.Type.RAPPEL).delete()


class NotificationViewSet(viewsets.GenericViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(utilisateur=self.request.user)

    def list(self, request):
        if request.user.role == 'MEDECIN':
            generer_rappels(request.user)
        queryset = self.get_queryset()
        return Response({
            'non_lues': queryset.filter(lue=False).count(),
            'notifications': NotificationSerializer(queryset[:30], many=True).data,
        })

    @action(detail=False, methods=['post'], url_path='tout-lire')
    def tout_lire(self, request):
        self.get_queryset().filter(lue=False).update(lue=True)
        return Response({'detail': 'Notifications marquées comme lues.'})

    @action(detail=True, methods=['post'])
    def lire(self, request, pk=None):
        notification = self.get_object()
        notification.lue = True
        notification.save(update_fields=['lue'])
        return Response({'detail': 'Notification lue.'})