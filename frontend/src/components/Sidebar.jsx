import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ICONES = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  calendrier: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </>
  ),
  rdv: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4" />
    </>
  ),
  medecins: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
  patients: (
    <>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  utilisateurs: (
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>
  ),
  profil: (
    <>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
    info: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </>
  ),
  cloche: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </>
  ),
  logout: (
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  ),
};

function Icone({ nom }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICONES[nom]}
    </svg>
  );
}

const MENUS = {
  ADMIN: [
    { to: "/dashboard-admin", label: "Tableau de bord", icone: "dashboard" },
    { to: "/calendrier-rdv", label: "Calendrier", icone: "calendrier" },
    { to: "/gestion-medecins", label: "Médecins", icone: "medecins" },
    { to: "/gestion-patients", label: "Patients", icone: "patients" },
    { to: "/gestion-utilisateurs", label: "Utilisateurs", icone: "utilisateurs" },
    { to: "/mon-profil", label: "Mon profil", icone: "profil" },
    { to: "/a-propos", label: "À propos", icone: "info" },
  ],
  MEDECIN: [
    { to: "/dashboard-medecin", label: "Tableau de bord", icone: "dashboard" },
    { to: "/planning", label: "Planning", icone: "calendrier" },
    { to: "/mon-profil", label: "Mon profil", icone: "profil" },
    { to: "/notifications", label: "Notifications", icone: "cloche", badge: true },
  ],
  PATIENT: [
    { to: "/medecins", label: "Médecins", icone: "medecins" },
    { to: "/mes-rendezvous", label: "Mes rendez-vous", icone: "rdv" },
    { to: "/mon-profil", label: "Mon profil", icone: "profil" },
  ],
};

const LIBELLE_ROLE = {
  ADMIN: "Administrateur",
  MEDECIN: "Médecin",
  PATIENT: "Patient",
};

function Sidebar({ ouvert = false, fermer = () => {}, nonLues = 0 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menu = MENUS[user?.role] || [];

  const seDeconnecter = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
      <aside className={"nav-side" + (ouvert ? " ouvert" : "")}>
      <div className="nav-side-logo">
        <div className="nav-side-badge">RM</div>
        <div>
          <p className="nav-side-titre">RDV Médical</p>
          <p className="nav-side-sous">Gestion des rendez-vous</p>
        </div>
        <button type="button" className="nav-side-fermer" aria-label="Fermer le menu" onClick={fermer}>
          ✕
        </button>
      </div>

      <nav className="nav-side-menu">
        {menu.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={fermer}
            className={({ isActive }) =>
              "nav-side-lien" + (isActive ? " actif" : "")
            }
          >
            <Icone nom={item.icone} />
            <span>{item.label}</span>
            {item.badge && nonLues > 0 && (
              <span className="nav-badge">{nonLues > 99 ? "99+" : nonLues}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="nav-side-bas">
        <div className="nav-side-user">
          <div className="nav-side-avatar">
            {user?.username?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <p className="nav-side-nom">{user?.username}</p>
            <p className="nav-side-role">{LIBELLE_ROLE[user?.role] || ""}</p>
          </div>
        </div>

        <button className="nav-side-logout" onClick={seDeconnecter}>
          <Icone nom="logout" />
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;