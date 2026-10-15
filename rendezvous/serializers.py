from rest_framework import serializers
from .models import RendezVous


class RendezVousSerializer(serializers.ModelSerializer):
    medecin_nom = serializers.CharField(source='medecin.utilisateur.last_name', read_only=True)
    patient_nom = serializers.CharField(source='patient.utilisateur.last_name', read_only=True)

    class Meta:
        model = RendezVous
        fields = ['id', 'patient', 'patient_nom', 'medecin', 'medecin_nom', 'date', 'heure', 'motif', 'statut', 'date_creation']
        read_only_fields = ['patient', 'date_creation']

    def validate(self, data):
        medecin = data.get('medecin', getattr(self.instance, 'medecin', None))
        date = data.get('date', getattr(self.instance, 'date', None))
        heure = data.get('heure', getattr(self.instance, 'heure', None))

        if medecin and date and heure:
            conflits = RendezVous.objects.filter(
                medecin=medecin, date=date, heure=heure
            ).exclude(statut='ANNULE')

            if self.instance:
                conflits = conflits.exclude(pk=self.instance.pk)

            if conflits.exists():
                raise serializers.ValidationError(
                    "Ce créneau est déjà réservé pour ce médecin. Choisis un autre horaire."
                )
        return data