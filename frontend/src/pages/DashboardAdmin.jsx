import { useEffect, useState } from "react";
import api from "../api/axios";
import Donut from "../components/graphiques/Donut";


const STATUT_LABELS = {
  EN_ATTENTE: "En attente",
  CONFIRME: "Confirmé",
  ANNULE: "Annulé",
  TERMINE: "Terminé",
};
const STATUT_CLASSES = {
  EN_ATTENTE: "badge-attente",
  CONFIRME: "badge-confirme",
  ANNULE: "badge-annule",
  TERMINE: "badge-termine",
};
const STATUT_COULEURS = {
  EN_ATTENTE: "var(--orange)",
  CONFIRME: "var(--vert)",
  ANNULE: "var(--rouge)",
  TERMINE: "var(--bleu)",
};

function DashboardAdmin() {
  const [patients, setPatients] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [rendezvous, setRendezvous] = useState([]);
  const [disponibilites, setDisponibilites] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("patients/"),
      api.get("medecins/"),
      api.get("rendezvous/"),
      api.get("disponibilites/"),
    ])
      .then(([resPatients, resMedecins, resRdv, resDispo]) => {
        setPatients(resPatients.data);
        setMedecins(resMedecins.data);
        const tries = [...resRdv.data].sort(
          (a, b) => new Date(a.date + "T" + a.heure) - new Date(b.date + "T" + b.heure)
        );
        setRendezvous(tries);
        setDisponibilites(resDispo.data);
      })
      .finally(() => setChargement(false));
  }, []);

  const aujourdHui = new Date().toISOString().slice(0, 10);
  const nbAujourdhui = rendezvous.filter((r) => r.date === aujourdHui && r.statut !== "ANNULE").length;
  const nbAVenir = rendezvous.filter((r) => r.date > aujourdHui && (r.statut === "EN_ATTENTE" || r.statut === "CONFIRME")).length;
  const nbAnnules = rendezvous.filter((r) => r.statut === "ANNULE").length;
  const medecinsAvecPlanning = new Set(disponibilites.map((d) => d.medecin)).size;

  const repartitionStatuts = ["EN_ATTENTE", "CONFIRME", "TERMINE", "ANNULE"].map((s) => ({
    label: STATUT_LABELS[s],
    value: rendezvous.filter((r) => r.statut === s).length,
    couleur: STATUT_COULEURS[s],
  }));

  const prochains = rendezvous
    .filter((r) => r.date >= aujourdHui && r.statut !== "ANNULE")
    .slice(0, 6);

  if (chargement) {
    return <div className="page"><p style={{ color: "var(--texte-secondaire)" }}>Chargement...</p></div>;
  }

  return (
    <div className="page">
      <div className="page-entete-fixe">
        <p className="page-title">Tableau de bord</p>
        <p className="page-subtitle">Vue d'ensemble de l'application</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "14px", marginBottom: "20px" }}>
        <div className="stat-tuile stat-tuile-violet">
          <span className="libelle">Patients</span>
          <span className="valeur">{patients.length}</span>
        </div>
        <div className="stat-tuile stat-tuile-bleu">
          <span className="libelle">Médecins</span>
          <span className="valeur">{medecins.length}</span>
        </div>
        <div className="stat-tuile stat-tuile-orange">
          <span className="libelle">RDV aujourd'hui</span>
          <span className="valeur">{nbAujourdhui}</span>
        </div>
        <div className="stat-tuile stat-tuile-primaire">
          <span className="libelle">RDV à venir</span>
          <span className="valeur">{nbAVenir}</span>
        </div>
        <div className="stat-tuile stat-tuile-rouge">
          <span className="libelle">Annulés</span>
          <span className="valeur">{nbAnnules}</span>
        </div>
        <div className="stat-tuile stat-tuile-vert">
          <span className="libelle">Médecins avec planning</span>
          <span className="valeur">{medecinsAvecPlanning} / {medecins.length}</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(260px, 360px) 1fr", gap: "16px", alignItems: "start" }}>
        <div className="card">
          <p style={{ fontSize: "14px", fontWeight: 500, margin: "0 0 14px" }}>Répartition des rendez-vous</p>
          <Donut segments={repartitionStatuts} />
        </div>

        <div className="card">
          <p style={{ fontSize: "14px", fontWeight: 500, margin: "0 0 12px" }}>Prochains rendez-vous</p>
          {prochains.length === 0 ? (
            <p style={{ color: "var(--texte-secondaire)" }}>Aucun rendez-vous à venir.</p>
          ) : (
            <div className="responsive-table-wrapper">
              <table>
                <thead>
                  <tr><th>Patient</th><th>Médecin</th><th>Date</th><th>Heure</th><th>Statut</th></tr>
                </thead>
                <tbody>
                  {prochains.map((rdv) => (
                    <tr key={rdv.id}>
                      <td>{rdv.patient_nom || "—"}</td>
                      <td>Dr {rdv.medecin_nom}</td>
                      <td>{rdv.date}</td>
                      <td>{rdv.heure}</td>
                      <td><span className={`badge ${STATUT_CLASSES[rdv.statut]}`}>{STATUT_LABELS[rdv.statut]}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardAdmin;