import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

const JOURS_SEMAINE = ["DIM", "LUN", "MAR", "MER", "JEU", "VEN", "SAM"];

function PrendreRendezVous() {
  const { medecinId } = useParams();
  const navigate = useNavigate();

  const [medecin, setMedecin] = useState(null);
  const [disponibilites, setDisponibilites] = useState([]);
  const [date, setDate] = useState("");
  const [heure, setHeure] = useState("");
  const [motif, setMotif] = useState("");
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState(false);
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    api.get(`medecins/${medecinId}/`).then((res) => setMedecin(res.data));
    api.get("disponibilites/", { params: { medecin: medecinId } }).then((res) => setDisponibilites(res.data));
  }, [medecinId]);

  const jourChoisi = date ? JOURS_SEMAINE[new Date(date).getDay()] : null;
  const creneauxDuJour = disponibilites.filter((d) => d.jour === jourChoisi);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur("");
    setEnvoi(true);
    try {
      await api.post("rendezvous/", {
        medecin: parseInt(medecinId),
        date,
        heure,
        motif,
      });
      setSucces(true);
      setTimeout(() => navigate("/mes-rendezvous"), 1200);
    } catch (err) {
      if (err.response?.status === 400) {
        setErreur(
          err.response.data?.non_field_errors?.[0] ||
          "Ce créneau est peut-être déjà pris, ou les informations sont invalides."
        );
      } else {
        setErreur("Une erreur est survenue.");
      }
    } finally {
      setEnvoi(false);
    }
  };

  if (!medecin) return <div className="page"><p className="etat-chargement">Chargement...</p></div>;

  return (
    <div className="page page-centree" style={{ maxWidth: "480px" }}>
      <Link to="/medecins" style={{ fontSize: "13px" }}>← Retour aux médecins</Link>
      <p className="page-title" style={{ marginTop: "12px" }}>Dr {medecin.nom} {medecin.prenom}</p>
      <p className="page-subtitle">{medecin.specialite_nom} · {medecin.tarif_consultation} Ar la consultation</p>

      <div className="card">
        {succes && <p className="auth-succes" style={{ marginBottom: "12px" }}>Rendez-vous demandé avec succès ! Redirection...</p>}
        {erreur && <p className="auth-erreur" style={{ marginBottom: "12px" }}>{erreur}</p>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="date">Date</label>
          <input
            id="date"
            type="date"
            min={new Date().toISOString().slice(0, 10)}
            value={date}
            onChange={(e) => { setDate(e.target.value); setHeure(""); }}
            required
          />

          {date && (
            <>
              <label htmlFor="heure">Créneau</label>
              {creneauxDuJour.length === 0 ? (
                <p className="etat-vide" style={{ padding: "8px 0" }}>Aucune disponibilité ce jour-là.</p>
              ) : (
                <select id="heure" value={heure} onChange={(e) => setHeure(e.target.value)} required>
                  <option value="">-- Choisir un créneau --</option>
                  {creneauxDuJour.map((c) => (
                    <option key={c.id} value={c.heure_debut}>
                      {c.heure_debut.slice(0, 5)} - {c.heure_fin.slice(0, 5)}
                    </option>
                  ))}
                </select>
              )}
            </>
          )}

          <label htmlFor="motif">Motif (facultatif)</label>
          <input id="motif" value={motif} onChange={(e) => setMotif(e.target.value)} placeholder="Ex : consultation générale" />

          <button type="submit" className="btn btn-primary btn-full" disabled={!heure || envoi}>
            {envoi ? "Envoi..." : "Confirmer le rendez-vous"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PrendreRendezVous;