from rest_framework.permissions import BasePermission


class EstAdmin(BasePermission):
    """Autorise uniquement les utilisateurs authentifiés avec le rôle ADMIN."""

    message = "Seul un administrateur peut effectuer cette action."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "ADMIN"
        )


class EstAdminOuLectureSeule(BasePermission):
    """Lecture libre pour tout le monde, écriture réservée aux administrateurs."""

    message = "Seul un administrateur peut modifier cette ressource."

    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return True
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "ADMIN"
        )


class EstAdminOuProprietaire(BasePermission):
    """Autorise un administrateur, ou le propriétaire du profil (patient/médecin), à le modifier."""

    message = "Tu ne peux modifier que ton propre profil."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if request.user.role == "ADMIN":
            return True
        return obj.utilisateur_id == request.user.id