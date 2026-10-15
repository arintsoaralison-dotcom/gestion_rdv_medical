import { useEffect, useState } from "react";
import api from "../api/axios";

function GestionPatients() {
  const [patients, setPatients] = useState([]);
  const [utilisateursDisponibles, setUtilisateursDisponibles] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [recherche, setRecherche] = useState("");

  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ date_naissance: "", adresse: "" });

  const [creation, setCreation] = useState(false);
  const [formCreation, setFormCreation] = useState({ utilisateur: "", date_naissance: "", adresse: "" });

  const charger = () => {
    setChargement(true);
    Promise.all([
      api.get("patients/"),
      api.get("comptes/utilisateurs/", { params: { role: "PATIENT" } }),
    ]).then(([resPatients, resUsers]) => {
      setPatients(resPatients.data);
      const idsDejaPatients = resPatients.data.map((p) => p.utilisateur);
      setUtilisateursDisponibles(resUsers.data.filter((u) => !idsDejaPatients.includes(u.id)));
    }).finally(() => setChargement(false));
  };

  useEffect(() => { charger(); }, []);

  const ouvrirEdition = (p) => {
    setEditId(p.id);
    setForm({ date_naissance: p.date_naissance || "", adresse: p.adresse || "" });
  };

  const enregistrer = async (id) => {
    await api.patch(`patients/${id}/`, form);
    setEditId(null);
    charger();
  };

  const supprimer = async (id, nom) => {
    if (!window.confirm(`Supprimer le profil patient de "${nom}" ?`)) return;
    await api.delete(`patients/${id}/`);
    charger();
  };

  const creerPatient = async (e) => {
    e.preventDefault();
    await api.post("patients/", formCreation);
    setCreation(false);
    setFormCreation({ utilisateur: "", date_naissance: "", adresse: "" });
    charger();
  };

  const patientsAffiches = recherche
    ? patients.filter((p) => `${p.nom} ${p.prenom} ${p.username}`.toLowerCase().includes(recherche.toLowerCase()))
    : patients;

  return (
    <div className="page">
      <div className="page-entete-fixe" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p className="page-title">Patients</p>
          <p className="page-subtitle">{patients.length} patient(s) enregistré(s)</p>
        </div>
        <button className="btn btn-primary" onClick={() => setCreation(!creation)}>
          {creation ? "Fermer" : "+ Nouveau patient"}
        </button>
      </div>

      {creation && (
        <div className="card" style={{ marginBottom: "16px" }}>
          <p style={{ fontWeight: 500, marginBottom: "12px" }}>Créer un profil patient</p>
          {utilisateursDisponibles.length === 0 ? (
            <p style={{ color: "var(--texte-secondaire)", fontSize: "13px" }}>
              Aucun compte avec le rôle PATIENT n'est disponible. Crée d'abord un compte avec ce rôle depuis "Gestion des utilisateurs" (ou via la page d'inscription).
            </p>
          ) : (
            <form onSubmit={creerPatient}>
              <label>Compte utilisateur (rôle PATIENT)</label>
              <select required value={formCreation.utilisateur} onChange={(e) => setFormCreation({ ...formCreation, utilisateur: e.target.value })}>
                <option value="">-- Choisir --</option>
                {utilisateursDisponibles.map((u) => (
                  <option key={u.id} value={u.id}>{u.username} ({u.first_name} {u.last_name})</option>
                ))}
              </select>

              <label>Date de naissance</label>
              <input type="date" value={formCreation.date_naissance} onChange={(e) => setFormCreation({ ...formCreation, date_naissance: e.target.value })} />

              <label>Adresse</label>
              <input value={formCreation.adresse} onChange={(e) => setFormCreation({ ...formCreation, adresse: e.target.value })} />

              <button type="submit" className="btn btn-primary btn-full">Créer</button>
            </form>
          )}
        </div>
      )}

      <div className="champ-ligne" style={{ marginBottom: "12px" }}>
        <input
          type="text"
          placeholder="Rechercher un patient (nom, identifiant)..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
        />
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          {recherche && (
            <button type="button" className="btn btn-outline btn-full" onClick={() => setRecherche("")}>
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      <div className="card">
        {chargement ? (
          <p style={{ color: "var(--texte-secondaire)" }}>Chargement...</p>
        ) : patientsAffiches.length === 0 ? (
          <p style={{ color: "var(--texte-secondaire)" }}>Aucun patient {recherche ? "ne correspond à ta recherche" : "enregistré"}.</p>
        ) : (
          patientsAffiches.map((p) => (
            <div key={p.id} style={{ borderBottom: "1px solid var(--bordure)", padding: "14px 4px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 500 }}>{p.nom} {p.prenom} <span style={{ color: "var(--texte-secondaire)", fontWeight: 400 }}>({p.username})</span></p>
                  <p style={{ margin: 0, fontSize: "13px", color: "var(--texte-secondaire)" }}>
                    {p.email || "Pas d'email"} · Né(e) le {p.date_naissance || "—"} · {p.adresse || "Adresse non renseignée"}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button className="btn btn-outline" onClick={() => ouvrirEdition(p)}>Modifier</button>
                  <button className="btn btn-danger" onClick={() => supprimer(p.id, p.nom)}>Supprimer</button>
                </div>
              </div>

              {editId === p.id && (
                <div style={{ marginTop: "12px", background: "var(--fond)", padding: "12px", borderRadius: "8px" }}>
                  <label>Date de naissance</label>
                  <input type="date" value={form.date_naissance} onChange={(e) => setForm({ ...form, date_naissance: e.target.value })} />
                  <label>Adresse</label>
                  <input value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} />
                  <div style={{ display: "flex", gap: "8px", marginTop: "10px", alignItems: "center" }}>
                    <button className="action-icone modifier" title="Enregistrer" onClick={() => enregistrer(p.id)}>✏️</button>
                    <button className="action-icone supprimer" title="Supprimer" onClick={() => supprimer(p.id, p.nom)}>🗑️</button>
                    <button className="btn btn-outline" style={{ marginLeft: "auto" }} onClick={() => setEditId(null)}>Annuler</button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default GestionPatients;