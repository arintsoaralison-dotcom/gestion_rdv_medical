import { useEffect, useState } from "react";
import api from "../api/axios";

const JOURS = [
  { code: "LUN", label: "Lundi" },
  { code: "MAR", label: "Mardi" },
  { code: "MER", label: "Mercredi" },
  { code: "JEU", label: "Jeudi" },
  { code: "VEN", label: "Vendredi" },
  { code: "SAM", label: "Samedi" },
  { code: "DIM", label: "Dimanche" },
];

function Planning() {
  const [disponibilites, setDisponibilites] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [form, setForm] = useState({ jour: "LUN", heure_debut: "", heure_fin: "" });
  const [erreur, setErreur] = useState("");

  const charger = () => {
    setChargement(true);
    api.get("disponibilites/").then((res) => setDisponibilites(res.data)).finally(() => setChargement(false));
  };

  useEffect(() => { charger(); }, []);

  const ajouter = async (e) => {
    e.preventDefault();
    setErreur("");
    if (!form.heure_debut || !form.heure_fin) {
      setErreur("Indique une heure de début et de fin.");
      return;
    }
    try {
      await api.post("disponibilites/", form);
      setForm({ jour: "LUN", heure_debut: "", heure_fin: "" });
      charger();
    } catch (err) {
      setErreur("Impossible d'ajouter ce créneau.");
    }
  };

  const supprimer = async (id) => {
    if (!window.confirm("Supprimer ce créneau de disponibilité ?")) return;
    await api.delete(`disponibilites/${id}/`);
    charger();
  };

  return (
    <div className="page page-centree">
      <div className="page-entete-fixe">
        <p className="page-title">Mon planning</p>
        <p className="page-subtitle">Gère tes créneaux de disponibilité, jour par jour.</p>
      </div>


      <div className="card carte-formulaire" style={{ marginBottom: "16px" }}>
        <p style={{ fontWeight: 500, marginBottom: "12px" }}>Ajouter un créneau</p>
        {erreur && <p className="auth-erreur">{erreur}</p>}
        <form onSubmit={ajouter}>
          <label>Jour</label>
          <select value={form.jour} onChange={(e) => setForm({ ...form, jour: e.target.value })}>
            {JOURS.map((j) => <option key={j.code} value={j.code}>{j.label}</option>)}
          </select>

          <div className="champ-ligne">
            <div>
              <label>Heure de début</label>
              <input type="time" value={form.heure_debut} onChange={(e) => setForm({ ...form, heure_debut: e.target.value })} required />
            </div>
            <div>
              <label>Heure de fin</label>
              <input type="time" value={form.heure_fin} onChange={(e) => setForm({ ...form, heure_fin: e.target.value })} required />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full">Ajouter</button>
        </form>
      </div>

      {chargement ? (
        <p className="etat-chargement">Chargement...</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
          {JOURS.map((j) => {
            const creneauxDuJour = disponibilites.filter((d) => d.jour === j.code);
            return (
              <div key={j.code} className="card">
                <p style={{ fontWeight: 600, marginBottom: "10px" }}>{j.label}</p>
                {creneauxDuJour.length === 0 ? (
                  <p style={{ fontSize: "13px", color: "var(--texte-secondaire)" }}>Aucun créneau.</p>
                ) : (
                  creneauxDuJour.map((c) => (
                    <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid var(--bordure)" }}>
                      <span style={{ fontSize: "13px" }}>{c.heure_debut.slice(0, 5)} – {c.heure_fin.slice(0, 5)}</span>
                      <button className="action-icone supprimer" onClick={() => supprimer(c.id)}>🗑️</button>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Planning;