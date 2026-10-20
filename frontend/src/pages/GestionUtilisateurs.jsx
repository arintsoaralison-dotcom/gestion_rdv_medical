import { useEffect, useState } from "react";
import api from "../api/axios";

const ROLES = ["PATIENT", "MEDECIN", "ADMIN"];

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

function GestionUtilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [creation, setCreation] = useState(false);
  const [afficherMdp, setAfficherMdp] = useState(false);
  const [erreurCreation, setErreurCreation] = useState("");
  const [cibleMdp, setCibleMdp] = useState(null);
  const [nouveauMdp, setNouveauMdp] = useState("");
  const [erreurMdp, setErreurMdp] = useState("");
  const [succesMdp, setSuccesMdp] = useState("");
  const [formCreation, setFormCreation] = useState({
    username: "", email: "", password: "", first_name: "", last_name: "", telephone: "", role: "PATIENT",
  });

  const charger = () => {
    setChargement(true);
    api.get("comptes/utilisateurs/").then((res) => setUtilisateurs(res.data)).finally(() => setChargement(false));
  };

  useEffect(() => { charger(); }, []);

  const changerRole = async (id, role) => {
    await api.patch(`comptes/utilisateurs/${id}/`, { role });
    charger();
  };

  const toggleActif = async (id, actuel) => {
    await api.patch(`comptes/utilisateurs/${id}/`, { is_active: !actuel });
    charger();
  };

  const supprimer = async (id, username) => {
    if (!window.confirm(`Supprimer définitivement le compte "${username}" ?`)) return;
    try {
      await api.delete(`comptes/utilisateurs/${id}/`);
      charger();
    } catch {
      alert("Suppression impossible (probablement lié à un profil patient/médecin existant).");
    }
  };

    const ouvrirMdp = (u) => {
    setCibleMdp(u);
    setNouveauMdp("");
    setErreurMdp("");
    setSuccesMdp("");
  };

  const reinitialiserMdp = async (e) => {
    e.preventDefault();
    setErreurMdp("");
    try {
      await api.post(`comptes/utilisateurs/${cibleMdp.id}/reinitialiser-mot-de-passe/`, {
        password: nouveauMdp,
      });
      setSuccesMdp(`Mot de passe de "${cibleMdp.username}" réinitialisé.`);
      setCibleMdp(null);
      setNouveauMdp("");
    } catch (err) {
      const messages = err.response?.data?.password;
      setErreurMdp(Array.isArray(messages) ? messages.join(" ") : "Impossible de réinitialiser ce mot de passe.");
    }
  };

  const creerUtilisateur = async (e) => {
    e.preventDefault();
    setErreurCreation("");
    try {
      await api.post("comptes/utilisateurs/", formCreation);
      setCreation(false);
      setAfficherMdp(false);
      setFormCreation({ username: "", email: "", password: "", first_name: "", last_name: "", telephone: "", role: "PATIENT" });
      charger();
    } catch (err) {
      setErreurCreation("Impossible de créer ce compte (nom d'utilisateur déjà pris ?).");
    }
  };

  return (
    <div className="page">
      <div className="page-entete-fixe" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p className="page-title">Gestion des utilisateurs</p>
          <p className="page-subtitle">Rôles et statut des comptes</p>
        </div>
        <button className="btn btn-primary" onClick={() => setCreation(!creation)}>
          {creation ? "Fermer" : "+ Ajouter un utilisateur"}
        </button>
      </div>

      {succesMdp && <p className="auth-succes">{succesMdp}</p>}

      {cibleMdp && (
        <div className="card" style={{ marginBottom: "16px" }}>
          <p style={{ fontWeight: 500, marginBottom: "12px" }}>
            Nouveau mot de passe pour « {cibleMdp.username} »
          </p>
          {erreurMdp && <p className="auth-erreur">{erreurMdp}</p>}
          <form onSubmit={reinitialiserMdp}>
            <label>Nouveau mot de passe</label>
            <input
              type="text"
              value={nouveauMdp}
              onChange={(e) => setNouveauMdp(e.target.value)}
              required
              minLength={8}
            />
            <div style={{ display: "flex", gap: "8px" }}>
              <button type="submit" className="btn btn-primary">Enregistrer</button>
              <button type="button" className="btn btn-outline" onClick={() => setCibleMdp(null)}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      {creation && (
        <div className="card" style={{ marginBottom: "16px" }}>
          <p style={{ fontWeight: 500, marginBottom: "12px" }}>Créer un compte</p>
          {erreurCreation && <p className="auth-erreur">{erreurCreation}</p>}
          <form onSubmit={creerUtilisateur}>
            <div className="champ-ligne">
              <div>
                <label>Prénom</label>
                <input value={formCreation.first_name} onChange={(e) => setFormCreation({ ...formCreation, first_name: e.target.value })} required />
              </div>
              <div>
                <label>Nom</label>
                <input value={formCreation.last_name} onChange={(e) => setFormCreation({ ...formCreation, last_name: e.target.value })} required />
              </div>
            </div>

            <label>Nom d'utilisateur</label>
            <input value={formCreation.username} onChange={(e) => setFormCreation({ ...formCreation, username: e.target.value })} required />

            <label>Email</label>
            <input type="email" value={formCreation.email} onChange={(e) => setFormCreation({ ...formCreation, email: e.target.value })} required />

            <div className="champ-ligne">
              <div>
                <label>Mot de passe</label>
                <div style={styleLigneChamp}>
                  <input
                    type={afficherMdp ? "text" : "password"}
                    value={formCreation.password}
                    onChange={(e) => setFormCreation({ ...formCreation, password: e.target.value })}
                    required
                    style={styleInput}
                  />
                  <button type="button" onClick={() => setAfficherMdp(!afficherMdp)} tabIndex={-1} style={styleBoutonOeil}>
                    {afficherMdp ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
              <div>
                <label>Téléphone</label>
                <input value={formCreation.telephone} onChange={(e) => setFormCreation({ ...formCreation, telephone: e.target.value })} />
              </div>
            </div>

            <label>Rôle</label>
            <select value={formCreation.role} onChange={(e) => setFormCreation({ ...formCreation, role: e.target.value })}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>

            <button type="submit" className="btn btn-primary btn-full">Créer le compte</button>
          </form>
        </div>
      )}

      <div className="card">
        {chargement ? (
          <p style={{ color: "var(--texte-secondaire)" }}>Chargement...</p>
        ) : (
          <div className="responsive-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Nom d'utilisateur</th><th>Nom complet</th><th>Email</th><th>Rôle</th><th>Actif</th><th></th>
                </tr>
              </thead>
              <tbody>
                {utilisateurs.map((u) => (
                  <tr key={u.id}>
                    <td style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span className="avatar-rond" style={{ width: 28, height: 28, fontSize: 12 }}>{u.username[0].toUpperCase()}</span>
                      {u.username}
                    </td>
                    <td>{u.first_name} {u.last_name}</td>
                    <td style={{ color: "var(--texte-secondaire)" }}>{u.email || "—"}</td>
                    <td>
                      <select value={u.role} onChange={(e) => changerRole(u.id, e.target.value)} style={{ marginBottom: 0, width: "auto" }}>
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td>
                      <button className={`btn ${u.is_active ? "btn-outline" : "btn-danger"}`} onClick={() => toggleActif(u.id, u.is_active)}>
                        {u.is_active ? "Actif" : "Désactivé"}
                      </button>
                    </td>
                    <td style={{ display: "flex", gap: "8px" }}>
                      <button className="btn btn-outline" onClick={() => ouvrirMdp(u)}>Mot de passe</button>
                      <button className="btn btn-danger" onClick={() => supprimer(u.id, u.username)}>Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default GestionUtilisateurs;