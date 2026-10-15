from rest_framework import serializers
from .models import Medecin, Specialite, Disponibilite


class SpecialiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialite
        fields = '__all__'


class DisponibiliteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Disponibilite
        fields = '__all__'


class MedecinSerializer(serializers.ModelSerializer):
    nom = serializers.CharField(source='utilisateur.last_name', read_only=True)
    prenom = serializers.CharField(source='utilisateur.first_name', read_only=True)
    specialite_nom = serializers.CharField(source='specialite.nom', read_only=True, default=None)

    class Meta:
        model = Medecin
        fields = [
            'id', 'utilisateur', 'nom', 'prenom',
            'specialite', 'specialite_nom',
            'numero_licence', 'tarif_consultation', 'bio',
        ]

    def validate_utilisateur(self, utilisateur):
        if utilisateur.role != 'MEDECIN':
            raise serializers.ValidationError(
                "Ce compte utilisateur n'a pas le rôle MEDECIN."
            )
        return utilisateur