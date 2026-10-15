from django.db import models
from comptes.models import Utilisateur

class Patient(models.Model):
    utilisateur = models.OneToOneField(Utilisateur, on_delete=models.CASCADE, related_name='patient')
    date_naissance = models.DateField(null=True, blank=True)
    adresse = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.utilisateur.first_name} {self.utilisateur.last_name}"
