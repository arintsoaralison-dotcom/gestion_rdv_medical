import { useEffect, useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const REDIRECTION_PAR_ROLE = {
  PATIENT: "/medecins",
  MEDECIN: "/dashboard-medecin",
  ADMIN: "/dashboard-admin",
};

const ROLES_INSCRIPTION = [
  ["PATIENT", "Patient"],
  ["MEDECIN", "Médecin"],
];

const styleLigneChamp = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  border: "1px solid var(--bordure)",
  borderRadius: "var(--rayon)",
  padding: "0 12px",
  background: "var(--surface)",
};

const styleInput = {
  flex: 1,
  border: "none",
  outline: "none",
  background: "transparent",
  padding: "11px 0",
  fontSize: "14px",
  fontFamily: "inherit",
  color: "var(--texte)",
};

const styleBoutonOeil = {
  background: "none",
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  padding: 0,
  flexShrink: 0,
  fontSize: "16px",
};

const messagesErreur = (data) => {
  if (!data || typeof data !== "object") return "";
  return Object.values(data)
    .flat()
    .filter((m) => typeof m === "string")
    .join(" ");
};

function Inscription() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    telephone: "",
    role: "PATIENT",
    specialite: "",
    numero_licence: "",
  });
  const [specialites, setSpecialites] = useState([]);
  const [afficherMdp, setAfficherMdp] = useState(false);
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState(false);
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    api.get("specialites/").then((res) => setSpecialites(res.data)).catch(() => {});
  }, []);

  if (user) {
    return <Navigate to={REDIRECTION_PAR_ROLE[user.role] || "/"} replace />;
  }

  const majChamp = (champ) => (e) => setForm((f) => ({ ...f, [champ]: e.target.value }));

  const sInscrire = async () => {
    setErreur("");
    setEnvoi(true);
    try {
      const donnees = {
        username: form.username,
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        telephone: form.telephone,
        role: form.role,
      };
      if (form.role === "MEDECIN") {
        donnees.specialite = form.specialite ? Number(form.specialite) : null;
        donnees.numero_licence = form.numero_licence;
      }
      await api.post("comptes/inscription/", donnees);
      setSucces(true);
      setTimeout(() => navigate("/", { replace: true }), 1200);
    } catch (err) {
      setErreur(
        messagesErreur(err.response?.data) ||
          "Impossible de créer le compte. Vérifie les informations saisies."
      );
    } finally {
      setEnvoi(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sInscrire();
  };

  const gererTouche = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sInscrire();
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-carte">
        <div className="auth-logo">
          <div className="sidebar-logo-badge">RM</div>
          <div>
            <p className="auth-titre" style={{ marginBottom: 0 }}>Créer un compte</p>
          </div>
        </div>

        <p className="auth-soustitre">Renseigne tes informations pour commencer.</p>

        {erreur && <p className="auth-erreur">{erreur}</p>}
        {succes && <p className="auth-succes">Compte créé avec succès ! Redirection...</p>}

        <form onSubmit={handleSubmit}>
          <label>Je m'inscris en tant que</label>
          <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
            {ROLES_INSCRIPTION.map(([valeur, libelle]) => (
              <button
                key={valeur}
                type="button"
                className={`btn ${form.role === valeur ? "btn-primary" : "btn-outline"}`}
                style={{ flex: 1 }}
                onClick={() => setForm((f) => ({ ...f, role: valeur }))}
              >
                {libelle}
              </button>
            ))}
          </div>

          <div className="champ-ligne">
            <div>
              <label htmlFor="first_name">Prénom</label>
              <input
                id="first_name"
                value={form.first_name}
                onChange={majChamp("first_name")}
                onKeyDown={gererTouche}
                required
              />
            </div>
            <div>
              <label htmlFor="last_name">Nom</label>
              <input
                id="last_name"
                value={form.last_name}
                onChange={majChamp("last_name")}
                onKeyDown={gererTouche}
                required
              />
            </div>
          </div>

          <label htmlFor="username">Nom d'utilisateur</label>
          <input
            id="username"
            value={form.username}
            onChange={majChamp("username")}
            onKeyDown={gererTouche}
            required
          />

          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={majChamp("email")}
            onKeyDown={gererTouche}
            required
          />

          <div className="champ-ligne">
            <div>
              <label htmlFor="password">Mot de passe</label>
              <div style={styleLigneChamp}>
                <input
                  id="password"
                  type={afficherMdp ? "text" : "password"}
                  value={form.password}
                  onChange={majChamp("password")}
                  onKeyDown={gererTouche}
                  required
                  style={styleInput}
                />
                <button type="button" onClick={() => setAfficherMdp(!afficherMdp)} tabIndex={-1} style={styleBoutonOeil}>
                  {afficherMdp ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="telephone">Téléphone</label>
              <input
                id="telephone"
                value={form.telephone}
                onChange={majChamp("telephone")}
                onKeyDown={gererTouche}
              />
            </div>
          </div>

          {form.role === "MEDECIN" && (
            <>
              <label htmlFor="specialite">Spécialité</label>
              <select id="specialite" value={form.specialite} onChange={majChamp("specialite")} required>
                <option value="">-- Choisir --</option>
                {specialites.map((s) => (
                  <option key={s.id} value={s.id}>{s.nom}</option>
                ))}
              </select>

              <label htmlFor="numero_licence">Numéro de licence</label>
              <input
                id="numero_licence"
                value={form.numero_licence}
                onChange={majChamp("numero_licence")}
                onKeyDown={gererTouche}
                required
              />
            </>
          )}

          <button type="submit" className="btn btn-primary btn-full" disabled={envoi}>
            {envoi ? "Création..." : "Créer mon compte"}
          </button>
        </form>

        <p className="auth-pied">
          Déjà inscrit ? <Link to="/">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}

export default Inscription;