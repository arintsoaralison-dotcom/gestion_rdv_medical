import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";
import useBloquerRetour from "../hooks/useBloquerRetour";

// Page d'accueil de chaque rôle après connexion
const ACCUEIL_PAR_ROLE = {
  PATIENT: "/medecins",
  MEDECIN: "/dashboard-medecin",
  ADMIN: "/dashboard-admin",
};

function AppLayout({ children }) {
  const { user } = useAuth();
  const { pathname } = useLocation();

  // Retour bloqué uniquement sur la page d'accueil du rôle
  useBloquerRetour(pathname === ACCUEIL_PAR_ROLE[user?.role]);

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-contenu">{children}</div>
    </div>
  );
}

export default AppLayout;