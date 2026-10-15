from django.contrib import admin
from .models import Medecin, Specialite, Disponibilite

admin.site.register(Medecin)
admin.site.register(Specialite)
admin.site.register(Disponibilite)
