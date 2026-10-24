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

// Vrai si la date et l'heure du rendez-vous sont déjà passées
const estDepasse = (rdv) => new Date(rdv.date + "T" + rdv.heure) < new Date();

// Une demande en attente dont la date est dépassée est « expirée » : plus d'action possible
const estExpire = (rdv) => rdv.statut === "EN_ATTENTE" && estDepasse(rdv);

function DashboardMedecin() {
  const [rendezvous, setRendezvous] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [dateRecherche, setDateRecherche] = useState("");

  const chargerRendezVous = () => {
    setChargement(true);
    api
      .get("rendezvous/")
      .then((res) => {
        const tries = [...res.data].sort(
          (a, b) => new Date(a.date + "T" + a.heure) - new Date(b.date + "T" + b.heure)
        );
        setRendezvous(tries);
      })
      .finally(() => setChargement(false));
  };

  useEffect(() => { chargerRendezVous(); }, []);

  const changerStatut = async (id, nouveauStatut) => {
    try {
      await api.patch(`rendezvous/${id}/`, { statut: nouveauStatut });
      chargerRendezVous();
    } catch (err) {
      alert(err.response?.data?.detail || "Impossible de mettre à jour ce rendez-vous.");
      chargerRendezVous();
    }
  };

  const aujourdHui = new Date().toISOString().slice(0, 10);
  const nbAujourdhui = rendezvous.filter((r) => r.date === aujourdHui && r.statut !== "ANNULE").length;
  const nbAcceptes = rendezvous.filter((r) => r.statut === "CONFIRME").length;
  const nbEnAttente = rendezvous.filter((r) => r.statut === "EN_ATTENTE").length;
  const nbTermines = rendezvous.filter((r) => r.statut === "TERMINE").length;

  const repartitionStatuts = ["EN_ATTENTE", "CONFIRME", "TERMINE", "ANNULE"].map((s) => ({
    label: STATUT_LABELS[s],
    value: rendezvous.filter((r) => r.statut === s).length,
    couleur: STATUT_COULEURS[s],
  }));

  const rendezvousAffiches = dateRecherche
    ? rendezvous.filter((r) => r.date === dateRecherche)
    : rendezvous;

  return (
    <div className="page">
      <div className="page-entete-fixe">
        <p className="page-title">Tableau de bord</p>
        <p className="page-subtitle">Gère les demandes et le suivi de tes rendez-vous.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "14px", marginBottom: "20px" }}>
        <div className="stat-tuile stat-tuile-bleu">
          <span className="libelle">Aujourd'hui</span>
          <span className="valeur">{nbAujourdhui}</span>
        </div>
        <div className="stat-tuile stat-tuile-vert">
          <span className="libelle">Acceptés</span>
          <span className="valeur">{nbAcceptes}</span>
        </div>
        <div className="stat-tuile stat-tuile-orange">
          <span className="libelle">En attente</span>
          <span className="valeur">{nbEnAttente}</span>
        </div>
        <div className="stat-tuile stat-tuile-violet">
          <span className="libelle">Terminés</span>
          <span className="valeur">{nbTermines}</span>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "20px", maxWidth: 420 }}>
        <p style={{ fontSize: "14px", fontWeight: 500, margin: "0 0 14px" }}>Répartition de mes rendez-vous</p>
        <Donut segments={repartitionStatuts} />
      </div>

      <div className="champ-ligne" style={{ marginBottom: "14px", maxWidth: 420 }}>
        <div>
          <label htmlFor="dateRecherche">Rechercher par date</label>
          <input id="dateRecherche" type="date" value={dateRecherche} onChange={(e) => setDateRecherche(e.target.value)} />
        </div>
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <button type="button" className="btn btn-outline btn-full" onClick={() => setDateRecherche("")}>Réinitialiser</button>
        </div>
      </div>

      <div className="card">
        {chargement ? (
          <p className="etat-chargement">Chargement...</p>
        ) : rendezvousAffiches.length === 0 ? (
          <p className="etat-vide">Aucun rendez-vous {dateRecherche ? "à cette date" : "pour le moment"}.</p>
        ) : (
          <div className="responsive-table-wrapper">
            <table>
              <thead>
                <tr><th>Date</th><th>Heure</th><th>Motif</th><th>Statut</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {rendezvousAffiches.map((rdv) => (
                  <tr key={rdv.id}>
                    <td>{rdv.date}</td>
                    <td>{rdv.heure.slice(0, 5)}</td>
                    <td>{rdv.motif || "—"}</td>
                    <td>
                      {estExpire(rdv) ? (
                        <span className="badge" style={{ background: "var(--bordure)", color: "var(--texte-secondaire)" }}>
                          Expiré
                        </span>
                      ) : (
                        <span className={`badge ${STATUT_CLASSES[rdv.statut]}`}>{STATUT_LABELS[rdv.statut]}</span>
                      )}
                    </td>
                    <td style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      {rdv.statut === "EN_ATTENTE" && !estExpire(rdv) && (
                        <>
                          <button className="btn btn-primary" onClick={() => changerStatut(rdv.id, "CONFIRME")}>Confirmer</button>
                          <button className="btn btn-danger" onClick={() => changerStatut(rdv.id, "ANNULE")}>Refuser</button>
                        </>
                      )}
                      {estExpire(rdv) && (
                        <span style={{ fontSize: "13px", color: "var(--texte-secondaire)" }}>Date dépassée</span>
                      )}
                      {rdv.statut === "CONFIRME" && (
                        <button className="btn btn-outline" onClick={() => changerStatut(rdv.id, "TERMINE")}>Marquer terminé</button>
                      )}
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

export default DashboardMedecin;