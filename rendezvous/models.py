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