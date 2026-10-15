from django.db import models
from comptes.models import Utilisateur

class Specialite(models.Model):
    nom = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.nom

class Medecin(models.Model):
    utilisateur = models.OneToOneField(Utilisateur, on_delete=models.CASCADE, related_name='medecin')
    specialite = models.ForeignKey(Specialite, on_delete=models.SET_NULL, null=True)
    numero_licence = models.CharField(max_length=50, unique=True)
    tarif_consultation = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    bio = models.TextField(blank=True)

    def __str__(self):
        return f"Dr {self.utilisateur.last_name} - {self.specialite}"

class Disponibilite(models.Model):
    JOURS = [
        ('LUN', 'Lundi'), ('MAR', 'Mardi'), ('MER', 'Mercredi'),
        ('JEU', 'Jeudi'), ('VEN', 'Vendredi'), ('SAM', 'Samedi'), ('DIM', 'Dimanche'),
    ]
    medecin = models.ForeignKey(Medecin, on_delete=models.CASCADE, related_name='disponibilites')
    jour = models.CharField(max_length=3, choices=JOURS)
    heure_debut = models.TimeField()
    heure_fin = models.TimeField()

    def __str__(self):
        return f"{self.medecin} - {self.jour} {self.heure_debut}-{self.heure_fin}"