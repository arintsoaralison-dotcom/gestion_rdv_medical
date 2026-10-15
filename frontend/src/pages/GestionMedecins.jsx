import { useEffect, useState } from "react";
import api from "../api/axios";

function GestionMedecins() {
  const [medecins, setMedecins] = useState([]);
  const [specialites, setSpecialites] = useState([]);
  const [utilisateursDisponibles, setUtilisateursDisponibles] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [recherche, setRecherche] = useState("");

  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ specialite: "", numero_licence: "", tarif_consultation: "", bio: "" });

  const [creation, setCreation] = useState(false);
  const [formCreation, setFormCreation] = useState({ utilisateur: "", specialite: "", numero_licence: "", tarif_consultation: "" });

  const charger = () => {
    setChargement(true);
    Promise.all([
      api.get("medecins/"),
      api.get("specialites/"),
      api.get("comptes/utilisateurs/", { params: { role: "MEDECIN" } }),
    ]).then(([resMedecins, resSpecialites, resUsers]) => {
      setMedecins(resMedecins.data);
      setSpecialites(resSpecialites.data);
      const idsDejaMedecins = resMedecins.data.map((m) => m.utilisateur);
      setUtilisateursDisponibles(resUsers.data.filter((u) => !idsDejaMedecins.includes(u.id)));
    }).finally(() => setChargement(false));
  };

  useEffect(() => { charger(); }, []);

  const ouvrirEdition = (m) => {
    setEditId(m.id);
    setForm({
      specialite: m.specialite || "",
      numero_licence: m.numero_licence || "",
      tarif_consultation: m.tarif_consultation || "",
      bio: m.bio || "",
    });
  };

  const enregistrer = async (id) => {
    await api.patch(`medecins/${id}/`, form);
    setEditId(null);
    charger();
  };

  const supprimer = async (id, nom) => {
    if (!window.confirm(`Supprimer le profil médecin de "${nom}" ?`)) return;
    await api.delete(`medecins/${id}/`);
    charger();
  };

  const creerMedecin = async (e) => {
    e.preventDefault();
    await api.post("medecins/", formCreation);
    setCreation(false);
    setFormCreation({ utilisateur: "", specialite: "", numero_licence: "", tarif_consultation: "" });
    charger();
  };

  const medecinsAffiches = recherche
    ? medecins.filter((m) =>
        `${m.nom} ${m.prenom} ${m.specialite_nom || ""} ${m.numero_licence}`.toLowerCase().includes(recherche.toLowerCase())
      )
    : medecins;

  return (
    <div className="page">
      <div className="page-entete-fixe" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p className="page-title">Médecins</p>
          <p className="page-subtitle">{medecins.length} médecin(s) enregistré(s)</p>
        </div>
        <button className="btn btn-primary" onClick={() => setCreation(!creation)}>
          {creation ? "Fermer" : "+ Nouveau médecin"}
        </button>
      </div>

      {creation && (
        <div className="card" style={{ marginBottom: "16px" }}>
          <p style={{ fontWeight: 500, marginBottom: "12px" }}>Créer un profil médecin</p>
          {utilisateursDisponibles.length === 0 ? (
            <p style={{ color: "var(--texte-secondaire)", fontSize: "13px" }}>
              Aucun compte avec le rôle MEDECIN n'est disponible. Crée d'abord un compte avec ce rôle depuis "Gestion des utilisateurs".
            </p>
          ) : (
            <form onSubmit={creerMedecin}>
              <label>Compte utilisateur (rôle MEDECIN)</label>
              <select required value={formCreation.utilisateur} onChange={(e) => setFormCreation({ ...formCreation, utilisateur: e.target.value })}>
                <option value="">-- Choisir --</option>
                {utilisateursDisponibles.map((u) => (
                  <option key={u.id} value={u.id}>{u.username} ({u.first_name} {u.last_name})</option>
                ))}
              </select>

              <label>Spécialité</label>
              <select required value={formCreation.specialite} onChange={(e) => setFormCreation({ ...formCreation, specialite: e.target.value })}>
                <option value="">-- Choisir --</option>
                {specialites.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
              </select>

              <label>Numéro de licence</label>
              <input required value={formCreation.numero_licence} onChange={(e) => setFormCreation({ ...formCreation, numero_licence: e.target.value })} />

              <label>Tarif consultation</label>
              <input type="number" step="0.01" required value={formCreation.tarif_consultation} onChange={(e) => setFormCreation({ ...formCreation, tarif_consultation: e.target.value })} />

              <button type="submit" className="btn btn-primary btn-full">Créer</button>
            </form>
          )}
        </div>
      )}

      <div className="champ-ligne" style={{ marginBottom: "12px" }}>
        <input
          type="text"
          placeholder="Rechercher un médecin (nom, spécialité, licence)..."
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
        ) : medecinsAffiches.length === 0 ? (
          <p style={{ color: "var(--texte-secondaire)" }}>Aucun médecin {recherche ? "ne correspond à ta recherche" : "enregistré"}.</p>
        ) : (
          medecinsAffiches.map((m) => (
            <div key={m.id} style={{ borderBottom: "1px solid var(--bordure)", padding: "14px 4px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span className="avatar-rond">{m.nom?.[0]?.toUpperCase()}</span>
                  <div>
                    <p style={{ margin: 0, fontWeight: 500 }}>Dr {m.nom} {m.prenom}</p>
                    <p style={{ margin: 0, fontSize: "13px", color: "var(--texte-secondaire)" }}>
                      {m.specialite_nom} · Licence {m.numero_licence} · {m.tarif_consultation} Ar
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button className="btn btn-outline" onClick={() => ouvrirEdition(m)}>Modifier</button>
                  <button className="btn btn-danger" onClick={() => supprimer(m.id, m.nom)}>Supprimer</button>
                </div>
              </div>

              {editId === m.id && (
                <div style={{ marginTop: "12px", background: "var(--fond)", padding: "12px", borderRadius: "8px" }}>
                  <label>Spécialité</label>
                  <select value={form.specialite} onChange={(e) => setForm({ ...form, specialite: e.target.value })}>
                    {specialites.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
                  </select>
                  <label>Numéro de licence</label>
                  <input value={form.numero_licence} onChange={(e) => setForm({ ...form, numero_licence: e.target.value })} />
                  <label>Tarif consultation</label>
                  <input type="number" step="0.01" value={form.tarif_consultation} onChange={(e) => setForm({ ...form, tarif_consultation: e.target.value })} />
                  <label>Bio</label>
                  <textarea rows="2" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
                  <div style={{ display: "flex", gap: "8px", marginTop: "10px", alignItems: "center" }}>
                    <button className="action-icone modifier" title="Enregistrer" onClick={() => enregistrer(m.id)}>✏️</button>
                    <button className="action-icone supprimer" title="Supprimer" onClick={() => supprimer(m.id, m.nom)}>🗑️</button>
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

export default GestionMedecins;