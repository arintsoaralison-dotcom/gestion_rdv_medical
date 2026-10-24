from django.conf import settings
from django.db import models
from patients.models import Patient
from medecins.models import Medecin


class RendezVous(models.Model):
    class Statut(models.TextChoices):
        EN_ATTENTE = 'EN_ATTENTE', 'En attente'
        CONFIRME = 'CONFIRME', 'Confirmé'
        ANNULE = 'ANNULE', 'Annulé'
        TERMINE = 'TERMINE', 'Terminé'

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='rendezvous')
    medecin = models.ForeignKey(Medecin, on_delete=models.CASCADE, related_name='rendezvous')
    date = models.DateField()
    heure = models.TimeField()
    motif = models.CharField(max_length=255, blank=True)
    statut = models.CharField(max_length=15, choices=Statut.choices, default=Statut.EN_ATTENTE)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-heure']

    def __str__(self):
        return f"{self.patient} avec {self.medecin} le {self.date} à {self.heure}"


class Notification(models.Model):
    class Type(models.TextChoices):
        NOUVELLE_DEMANDE = 'NOUVELLE_DEMANDE', 'Nouvelle demande'
        RAPPEL = 'RAPPEL', 'Rappel'
        CONFIRMATION = 'CONFIRMATION', 'Rendez-vous confirmé'

    utilisateur = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications'
    )
    rendezvous = models.ForeignKey(RendezVous, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=20, choices=Type.choices)
    message = models.CharField(max_length=255)
    lue = models.BooleanField(default=False)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_creation']
        constraints = [
            # Une seule notification de chaque type par rendez-vous
            models.UniqueConstraint(
                fields=['rendezvous', 'type'], name='notification_unique_par_rdv_et_type'
            ),
        ]

    def __str__(self):
        return f"{self.get_type_display()} pour {self.utilisateur}"