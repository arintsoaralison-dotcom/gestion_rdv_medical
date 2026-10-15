from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Utilisateur


class UtilisateurAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Informations complémentaires', {'fields': ('role', 'telephone')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Informations complémentaires', {'fields': ('role', 'telephone')}),
    )
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_staff')


admin.site.register(Utilisateur, UtilisateurAdmin)