import { useEffect, useState } from "react";
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
  const [menuOuvert, setMenuOuvert] = useState(false);

  // Retour bloqué uniquement sur la page d'accueil du rôle
  useBloquerRetour(pathname === ACCUEIL_PAR_ROLE[user?.role]);

  // La touche Échap ferme le menu (utile sur tablette avec clavier)
  useEffect(() => {
    if (!menuOuvert) return;
    const surTouche = (e) => {
      if (e.key === "Escape") setMenuOuvert(false);
    };
    window.addEventListener("keydown", surTouche);
    return () => window.removeEventListener("keydown", surTouche);
  }, [menuOuvert]);

  return (
    <div className="app-shell">
      {/* Barre du haut, visible uniquement sur tablette et téléphone */}
      <header className="barre-mobile">
        <button
          type="button"
          className="barre-mobile-bouton"
          aria-label="Ouvrir le menu"
          onClick={() => setMenuOuvert(true)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="nav-side-badge petit">RM</div>
        <p className="barre-mobile-titre">RDV Médical</p>
      </header>

      {menuOuvert && <div className="nav-overlay" onClick={() => setMenuOuvert(false)} />}

      <Sidebar ouvert={menuOuvert} fermer={() => setMenuOuvert(false)} />
      <div className="app-contenu">{children}</div>
    </div>
  );
}

export default AppLayout;