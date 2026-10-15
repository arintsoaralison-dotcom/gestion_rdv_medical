from django.contrib.auth.models import AbstractUser
from django.db import models

class Utilisateur(AbstractUser):
    class Role(models.TextChoices):
        PATIENT = 'PATIENT', 'Patient'
        MEDECIN = 'MEDECIN', 'Médecin'
        ADMIN = 'ADMIN', 'Administrateur'

    role = models.CharField(max_length=10, choices=Role.choices, default=Role.PATIENT)
    telephone = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return f"{self.username} ({self.role})"