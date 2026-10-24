import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

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

function MesRendezVous() {
  const [rendezvous, setRendezvous] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  const chargerRendezVous = () => {
    setChargement(true);
    api
      .get("rendezvous/")
      .then((res) => {
        const tries = [...res.data].sort(
          (a, b) => new Date(b.date + "T" + b.heure) - new Date(a.date + "T" + a.heure)
        );
        setRendezvous(tries);
      })
      .catch(() => setErreur("Impossible de charger les rendez-vous."))
      .finally(() => setChargement(false));
  };

  useEffect(() => {
    chargerRendezVous();
  }, []);

  const annulerRendezVous = async (id) => {
    if (!window.confirm("Confirmer l'annulation de ce rendez-vous ?")) return;
    try {
      await api.patch(`rendezvous/${id}/`, { statut: "ANNULE" });
      chargerRendezVous();
    } catch (err) {
      alert(err.response?.data?.detail || "Impossible d'annuler ce rendez-vous.");
      // Le médecin a peut-être confirmé entre-temps : on rafraîchit la liste
      chargerRendezVous();
    }
  };

  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p className="page-title">Mes rendez-vous</p>
          <p className="page-subtitle">Historique et suivi de tes rendez-vous.</p>
        </div>
        <Link to="/medecins" className="btn btn-primary">+ Nouveau rendez-vous</Link>
      </div>

      <div className="card">
        {chargement ? (
          <p className="etat-chargement">Chargement...</p>
        ) : erreur ? (
          <p className="etat-erreur">{erreur}</p>
        ) : rendezvous.length === 0 ? (
          <p className="etat-vide">Tu n'as encore aucun rendez-vous.</p>
        ) : (
          <div className="responsive-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Médecin</th>
                  <th>Date</th>
                  <th>Heure</th>
                  <th>Motif</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rendezvous.map((rdv) => (
                  <tr key={rdv.id}>
                    <td>Dr {rdv.medecin_nom}</td>
                    <td>{rdv.date}</td>
                    <td>{rdv.heure.slice(0, 5)}</td>
                    <td>{rdv.motif || "—"}</td>
                    <td><span className={`badge ${STATUT_CLASSES[rdv.statut]}`}>{STATUT_LABELS[rdv.statut]}</span></td>
                    <td>
                      {rdv.statut === "EN_ATTENTE" && (
                        <button className="btn btn-danger" onClick={() => annulerRendezVous(rdv.id)}>Annuler</button>
                      )}
                      {rdv.statut === "CONFIRME" && (
                        <span style={{ fontSize: "13px", color: "var(--texte-secondaire)" }}>
                          Annulation impossible
                        </span>
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

export default MesRendezVous;