import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [afficherMdp, setAfficherMdp] = useState(false);
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);
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

          <a href="#" className="auth-glass-lien" onClick={(e) => e.preventDefault()}>
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
    </div>
  );
}

export default Login;