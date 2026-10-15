from rest_framework import viewsets, permissions
from .models import Patient
from .serializers import PatientSerializer
from comptes.permissions import EstAdmin, EstAdminOuProprietaire


class PatientViewSet(viewsets.ModelViewSet):
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Patient.objects.select_related('utilisateur').all()
        if user.role == 'ADMIN':
            return queryset
        if user.role == 'PATIENT':
            return queryset.filter(utilisateur=user)
        if user.role == 'MEDECIN':
            return queryset.filter(rendezvous__medecin__utilisateur=user).distinct()
        return Patient.objects.none()

    def get_permissions(self):
        if self.action in ['create', 'destroy']:
            return [EstAdmin()]
        if self.action in ['update', 'partial_update']:
            return [EstAdminOuProprietaire()]
        return [permissions.IsAuthenticated()]