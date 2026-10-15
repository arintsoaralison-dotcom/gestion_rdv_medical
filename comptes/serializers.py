from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Utilisateur


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