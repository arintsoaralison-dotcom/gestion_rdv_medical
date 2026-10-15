import { useEffect, useState } from "react";
import api from "../api/axios";

const STATUT_COULEURS = {
  EN_ATTENTE: "var(--orange)",
  CONFIRME: "var(--vert)",
  ANNULE: "var(--rouge)",
  TERMINE: "var(--bleu)",
};
const STATUT_LABELS = {
  EN_ATTENTE: "En attente",
  CONFIRME: "Confirmé",
  ANNULE: "Annulé",
  TERMINE: "Terminé",
};
const NOMS_MOIS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const NOMS_JOURS = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];

function CalendrierRendezVous() {
  const [rendezvous, setRendezvous] = useState([]);
  const [chargement, setChargement] = useState(true);
  const aujourdHui = new Date();
  const [mois, setMois] = useState(aujourdHui.getMonth());
  const [annee, setAnnee] = useState(aujourdHui.getFullYear());
  const [jourSelectionne, setJourSelectionne] = useState(null);

  useEffect(() => {
    api.get("rendezvous/").then((res) => setRendezvous(res.data)).finally(() => setChargement(false));
  }, []);

  const premierJourMois = new Date(annee, mois, 1);
  const decalage = (premierJourMois.getDay() + 6) % 7; // 0 = lundi
  const nbJours = new Date(annee, mois + 1, 0).getDate();

  const cases = [];
  for (let i = 0; i < decalage; i++) cases.push(null);
  for (let j = 1; j <= nbJours; j++) cases.push(j);

  const rdvParJour = (jour) => {
    const dateStr = `${annee}-${String(mois + 1).padStart(2, "0")}-${String(jour).padStart(2, "0")}`;
    return rendezvous.filter((r) => r.date === dateStr);
  };

  const changerMois = (delta) => {
    let m = mois + delta;
    let a = annee;
    if (m < 0) { m = 11; a -= 1; }
    if (m > 11) { m = 0; a += 1; }
    setMois(m);
    setAnnee(a);
    setJourSelectionne(null);
  };

  const rdvDuJourSelectionne = jourSelectionne ? rdvParJour(jourSelectionne) : [];

  return (
    <div className="page">
      <div className="page-entete-fixe">
        <p className="page-title">Calendrier des rendez-vous</p>
        <p className="page-subtitle">Vue mensuelle de tous les rendez-vous.</p>
      </div>
      <div className="card" style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <button className="btn btn-outline" onClick={() => changerMois(-1)}>←</button>
          <p style={{ fontWeight: 700, margin: 0 }}>{NOMS_MOIS[mois]} {annee}</p>
          <button className="btn btn-outline" onClick={() => changerMois(1)}>→</button>
        </div>

        {chargement ? (
          <p className="etat-chargement">Chargement...</p>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "4px" }}>
              {NOMS_JOURS.map((j) => (
                <div key={j} style={{ textAlign: "center", fontSize: "11px", fontWeight: 600, color: "var(--texte-secondaire)" }}>{j}</div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
              {cases.map((jour, i) => {
                if (jour === null) return <div key={i} />;
                const rdvs = rdvParJour(jour);
                const estAujourdhui = jour === aujourdHui.getDate() && mois === aujourdHui.getMonth() && annee === aujourdHui.getFullYear();
                return (
                  <button
                    key={i}
                    onClick={() => setJourSelectionne(jour)}
                    style={{
                      aspectRatio: "1",
                      border: estAujourdhui ? "2px solid var(--primaire)" : "1px solid var(--bordure)",
                      borderRadius: "8px",
                      background: jourSelectionne === jour ? "var(--primaire-clair)" : "var(--surface)",
                      cursor: "pointer",
                      padding: "4px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "2px",
                    }}
                  >
                    <span style={{ fontSize: "12px", fontWeight: 600 }}>{jour}</span>
                    <div style={{ display: "flex", gap: "2px", flexWrap: "wrap", justifyContent: "center" }}>
                      {rdvs.slice(0, 4).map((r) => (
                        <span key={r.id} style={{ width: "5px", height: "5px", borderRadius: "50%", background: STATUT_COULEURS[r.statut] }} />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {jourSelectionne && (
        <div className="card">
          <p style={{ fontWeight: 500, marginBottom: "12px" }}>Rendez-vous du {jourSelectionne}/{mois + 1}/{annee}</p>
          {rdvDuJourSelectionne.length === 0 ? (
            <p className="etat-vide">Aucun rendez-vous ce jour-là.</p>
          ) : (
            <div className="responsive-table-wrapper">
              <table>
                <thead><tr><th>Patient</th><th>Médecin</th><th>Heure</th><th>Statut</th></tr></thead>
                <tbody>
                  {rdvDuJourSelectionne.map((r) => (
                    <tr key={r.id}>
                      <td>{r.patient_nom || "—"}</td>
                      <td>Dr {r.medecin_nom}</td>
                      <td>{r.heure.slice(0, 5)}</td>
                      <td><span style={{ color: STATUT_COULEURS[r.statut], fontWeight: 600 }}>{STATUT_LABELS[r.statut]}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CalendrierRendezVous;