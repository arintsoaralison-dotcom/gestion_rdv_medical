import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const REDIRECTION_PAR_ROLE = {
  PATIENT: "/medecins",
  MEDECIN: "/dashboard-medecin",
  ADMIN: "/dashboard-admin",
};

const styleLigneChamp = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "8px",
  padding: "0 14px",
};

const styleInput = {
  flex: 1,
  background: "transparent",
  border: "none",
  outline: "none",
  color: "#fff",
  padding: "11px 0",
  fontSize: "15px",
  fontFamily: "inherit",
};

const styleLabel = {
  display: "block",
  color: "rgba(255,255,255,0.7)",
  fontSize: "13px",
  fontWeight: 600,
  marginBottom: "6px",
  textAlign: "left",
};

const styleBoutonOeil = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "rgba(255,255,255,0.55)",
  display: "flex",
  padding: 0,
  flexShrink: 0,
};

function IconeOeil({ ouvert }) {
  return ouvert ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M10.6 5.2A10.6 10.6 0 0 1 12 5c5 0 9 4 10 7-0.4 1.1-1.1 2.3-2.1 3.4M6.6 6.6C4.6 8 3.3 10 2 12c1 3 5 7 10 7 1.5 0 2.9-0.3 4.1-0.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M2 12c1-3 5-7 10-7s9 4 10 7c-1 3-5 7-10 7s-9-4-10-7z" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

const FORM_MDP_VIDE = { username: "", email: "", password: "", confirmation: "" };

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [afficherMdp, setAfficherMdp] = useState(false);
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  const [fenetreMdp, setFenetreMdp] = useState(false);
  const [formMdp, setFormMdp] = useState(FORM_MDP_VIDE);
  const [erreurMdp, setErreurMdp] = useState("");
  const [succesMdp, setSuccesMdp] = useState("");
  const [envoiMdp, setEnvoiMdp] = useState(false);

  const { user, login } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to={REDIRECTION_PAR_ROLE[user.role] || "/"} replace />;
  }

  const seConnecter = async () => {
    setErreur("");
    setEnvoi(true);
    try {
      const role = await login(username, password);
      navigate(REDIRECTION_PAR_ROLE[role] || "/", { replace: true });
    } catch (err) {
      if (err.response?.status === 401) {
        setErreur("Nom d'utilisateur ou mot de passe incorrect.");
      } else {
        setErreur("Impossible de se connecter. Réessaie plus tard.");
      }
    } finally {
      setEnvoi(false);
    }
  };

  const reinitialiserMdp = async (e) => {
    e.preventDefault();
    setErreurMdp("");
    if (formMdp.password !== formMdp.confirmation) {
      setErreurMdp("Les deux mots de passe ne sont pas identiques.");
      return;
    }
    setEnvoiMdp(true);
    try {
      await api.post("comptes/reinitialiser-mot-de-passe/", {
        username: formMdp.username,
        email: formMdp.email,
        password: formMdp.password,
      });
      setFenetreMdp(false);
      setFormMdp(FORM_MDP_VIDE);
      setSuccesMdp("Mot de passe modifié. Tu peux maintenant te connecter.");
    } catch (err) {
      if (err.response?.status === 429) {
        setErreurMdp("Trop de tentatives. Réessaie dans une heure.");
      } else {
        const mdp = err.response?.data?.password;
        setErreurMdp(
          Array.isArray(mdp)
            ? mdp.join(" ")
            : err.response?.data?.detail || "Impossible de modifier le mot de passe."
        );
      }
    } finally {
      setEnvoiMdp(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    seConnecter();
  };

  const gererTouche = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      seConnecter();
    }
  };

  return (
    <div className="auth-glass-page">
      <div className="auth-glass-card">
        <div className="auth-glass-avatar">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" stroke="white" strokeWidth="1.6" />
            <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </div>

        <h1>Connexion</h1>
        <p className="auth-glass-soustitre">Accède à ton espace patient, médecin ou admin.</p>

        {erreur && <p className="auth-erreur">{erreur}</p>}
        {succesMdp && <p className="auth-succes">{succesMdp}</p>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "18px", textAlign: "left" }}>
            <label htmlFor="username" style={styleLabel}>Nom d'utilisateur</label>
            <div style={styleLigneChamp}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, color: "rgba(255,255,255,0.55)" }}>
                <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
                <path d="M5 19c0-2.8 3.1-5 7-5s7 2.2 7 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <input
                id="username"
                placeholder="jane.doe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={gererTouche}
                autoComplete="username"
                required
                style={styleInput}
              />
            </div>
          </div>

          <div style={{ marginBottom: "6px", textAlign: "left" }}>
            <label htmlFor="password" style={styleLabel}>Mot de passe</label>
            <div style={styleLigneChamp}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, color: "rgba(255,255,255,0.55)" }}>
                <rect x="5" y="10" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.6" />
              </svg>
              <input
                id="password"
                type={afficherMdp ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={gererTouche}
                autoComplete="current-password"
                required
                style={styleInput}
              />
              <button type="button" onClick={() => setAfficherMdp(!afficherMdp)} tabIndex={-1} style={styleBoutonOeil}>
                <IconeOeil ouvert={afficherMdp} />
              </button>
            </div>
          </div>

          <a
            href="#"
            className="auth-glass-lien"
            onClick={(e) => {
              e.preventDefault();
              setErreurMdp("");
              setSuccesMdp("");
              setFenetreMdp(true);
            }}
          >
            Mot de passe oublié ?
          </a>

          <button type="submit" className="btn btn-primary btn-full" disabled={envoi}>
            {envoi ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="auth-glass-pied">
          Pas encore de compte ? <Link to="/inscription">Créer un compte</Link>
        </p>
      </div>

      {fenetreMdp && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "16px", zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#10244f", border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "14px", padding: "24px", width: "100%", maxWidth: "400px",
              maxHeight: "90vh", overflowY: "auto", color: "#fff",
            }}
          >
            <h2 style={{ marginBottom: "6px", fontSize: "20px" }}>Mot de passe oublié</h2>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", marginBottom: "16px" }}>
              Renseigne les informations de ton compte, puis choisis un nouveau mot de passe.
            </p>

            {erreurMdp && <p className="auth-erreur">{erreurMdp}</p>}

            <form onSubmit={reinitialiserMdp}>
              {[
                ["username", "Nom d'utilisateur", "text"],
                ["email", "Email du compte", "email"],
                ["password", "Nouveau mot de passe", "password"],
                ["confirmation", "Confirmer le mot de passe", "password"],
              ].map(([cle, libelle, type]) => (
                <div key={cle} style={{ marginBottom: "14px", textAlign: "left" }}>
                  <label style={styleLabel}>{libelle}</label>
                  <div style={styleLigneChamp}>
                    <input
                      type={type}
                      value={formMdp[cle]}
                      onChange={(e) => setFormMdp({ ...formMdp, [cle]: e.target.value })}
                      required
                      style={styleInput}
                    />
                  </div>
                </div>
              ))}

              <div style={{ display: "flex", gap: "8px", marginTop: "18px" }}>
                <button type="submit" className="btn btn-primary" disabled={envoiMdp} style={{ flex: 1 }}>
                  {envoiMdp ? "Enregistrement..." : "Enregistrer"}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setFenetreMdp(false)}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;