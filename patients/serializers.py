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

    def validate_date_naissance(self, valeur):
        """Une date de naissance déjà enregistrée ne peut être changée que par un administrateur."""
        request = self.context.get('request')
        if (
            self.instance is not None
            and request is not None
            and request.user.role != 'ADMIN'
            and self.instance.date_naissance
            and valeur != self.instance.date_naissance
        ):
            raise serializers.ValidationError("La date de naissance ne peut pas être modifiée.")
        return valeur