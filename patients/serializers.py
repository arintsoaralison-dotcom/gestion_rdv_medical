from rest_framework import serializers
from .models import Patient


class PatientSerializer(serializers.ModelSerializer):
    nom = serializers.CharField(source='utilisateur.last_name', read_only=True)
    prenom = serializers.CharField(source='utilisateur.first_name', read_only=True)
    username = serializers.CharField(source='utilisateur.username', read_only=True)
    email = serializers.CharField(source='utilisateur.email', read_only=True)

    class Meta:
        model = Patient
        fields = ['id', 'utilisateur', 'nom', 'prenom', 'username', 'email', 'date_naissance', 'adresse']