import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AppLayout from "./AppLayout";

const REDIRECTION_PAR_ROLE = {
  PATIENT: "/medecins",
  MEDECIN: "/dashboard-medecin",
  ADMIN: "/dashboard-admin",
};

function ProtectedRoute({ children, rolesAutorises }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (rolesAutorises && !rolesAutorises.includes(user.role)) {
    // Connecté, mais avec le mauvais rôle : renvoyer vers son propre espace
    return <Navigate to={REDIRECTION_PAR_ROLE[user.role] || "/"} replace />;
  }

  return <AppLayout>{children}</AppLayout>;
}

export default ProtectedRoute;
