from django.db import transaction
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Utilisateur
from medecins.models import Medecin, Specialite
from patients.models import Patient


class UtilisateurSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Utilisateur
        fields = ['id', 'username', 'email', 'password', 'first_name', 'last_name', 'role', 'telephone']

    def create(self, validated_data):
        user = Utilisateur(**{k: v for k, v in validated_data.items() if k != 'password'})
        user.set_password(validated_data['password'])
        user.save()
        return user


class InscriptionSerializer(serializers.ModelSerializer):
    """Inscription publique : patient ou médecin (jamais administrateur)."""
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(
        choices=[('PATIENT', 'Patient'), ('MEDECIN', 'Médecin')],
        default='PATIENT',
    )
    specialite = serializers.PrimaryKeyRelatedField(
        queryset=Specialite.objects.all(), required=False, allow_null=True, write_only=True,
    )
    numero_licence = serializers.CharField(
        required=False, allow_blank=True, write_only=True, max_length=50,
    )

    class Meta:
        model = Utilisateur
        fields = [
            'id', 'username', 'email', 'password', 'first_name', 'last_name',
            'telephone', 'role', 'specialite', 'numero_licence',
        ]

    def validate(self, attrs):
        if attrs.get('role') == 'MEDECIN':
            if not attrs.get('specialite'):
                raise serializers.ValidationError({'specialite': 'Choisis ta spécialité.'})
            licence = (attrs.get('numero_licence') or '').strip()
            if not licence:
                raise serializers.ValidationError(
                    {'numero_licence': 'Le numéro de licence est obligatoire pour un médecin.'}
                )
            if Medecin.objects.filter(numero_licence=licence).exists():
                raise serializers.ValidationError(
                    {'numero_licence': 'Ce numéro de licence est déjà utilisé.'}
                )
            attrs['numero_licence'] = licence
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        password = validated_data.pop('password')
        specialite = validated_data.pop('specialite', None)
        licence = validated_data.pop('numero_licence', '')
        role = validated_data.get('role', 'PATIENT')

        user = Utilisateur(**validated_data)
        user.set_password(password)
        user.save()

        if role == 'MEDECIN':
            Medecin.objects.create(utilisateur=user, specialite=specialite, numero_licence=licence)
        else:
            Patient.objects.create(utilisateur=user)
        return user


class UtilisateurGestionSerializer(serializers.ModelSerializer):
    """Utilisé par l'admin pour lister les comptes et changer leur rôle / statut."""

    class Meta:
        model = Utilisateur
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'telephone', 'is_active', 'date_joined',
        ]
        read_only_fields = ['username', 'email', 'first_name', 'last_name', 'date_joined']


class MonProfilSerializer(serializers.ModelSerializer):
    """Utilisé par un utilisateur connecté pour voir/modifier SON PROPRE compte."""

    class Meta:
        model = Utilisateur
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'telephone', 'role']
        read_only_fields = ['id', 'username', 'role']


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['username'] = user.username
        token['id'] = user.id
        return token