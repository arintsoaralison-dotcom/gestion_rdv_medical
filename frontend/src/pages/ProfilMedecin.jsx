import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
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

function ProfilMedecin() {
  const { medecinId } = useParams();
  const [medecin, setMedecin] = useState(null);
  const [disponibilites, setDisponibilites] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    api.get(`medecins/${medecinId}/`).then((res) => setMedecin(res.data)).finally(() => setChargement(false));
    api
      .get("disponibilites/", { params: { medecin: medecinId } })
      .then((res) => setDisponibilites(res.data))
      .catch(() => setDisponibilites([]));
  }, [medecinId]);

  if (chargement) return <div className="page"><p className="etat-chargement">Chargement...</p></div>;
  if (!medecin) return <div className="page"><p className="etat-erreur">Médecin introuvable.</p></div>;

  // Jours qui ont au moins un créneau, dans l'ordre de la semaine, créneaux triés par heure
  const planning = JOURS.map((j) => ({
    ...j,
    creneaux: disponibilites
      .filter((d) => d.jour === j.code)
      .sort((a, b) => a.heure_debut.localeCompare(b.heure_debut)),
  })).filter((j) => j.creneaux.length > 0);

  return (
    <div className="page page-centree">
      <Link to="/medecins" style={{ fontSize: "13px" }}>← Retour à la liste</Link>

      <div className="card carte-formulaire" style={{ marginTop: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
          <span className="avatar-rond" style={{ width: 48, height: 48, fontSize: 18 }}>
            {medecin.nom?.[0]?.toUpperCase()}
          </span>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: "17px" }}>Dr {medecin.nom} {medecin.prenom}</p>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--texte-secondaire)" }}>
              {medecin.specialite_nom || "Spécialité non renseignée"}
            </p>
          </div>
        </div>

        <p style={{ fontSize: "14px" }}>{medecin.bio || "Aucune biographie renseignée."}</p>
        <p style={{ fontSize: "14px", color: "var(--texte-secondaire)" }}>
          Tarif de consultation : <strong style={{ color: "var(--texte)" }}>{medecin.tarif_consultation} Ar</strong>
        </p>

        <p style={{ fontWeight: 700, marginTop: "20px", marginBottom: "2px" }}>Disponibilités</p>
        <p style={{ fontSize: "13px", color: "var(--texte-secondaire)", marginBottom: "6px" }}>
          Créneaux proposés chaque semaine.
        </p>

        {planning.length === 0 ? (
          <p className="etat-vide" style={{ padding: "8px 0" }}>
            Ce médecin n'a pas encore renseigné ses disponibilités.
          </p>
        ) : (
          <div>
            {planning.map((j) => (
              <div
                key={j.code}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 0",
                  borderBottom: "1px solid var(--bordure)",
                }}
              >
                <span style={{ width: "92px", fontWeight: 600, fontSize: "14px" }}>{j.label}</span>
                {j.creneaux.map((c) => (
                  <span
                    key={c.id}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "999px",
                      background: "var(--primaire-clair)",
                      color: "var(--primaire)",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
                  >
                    {c.heure_debut.slice(0, 5)} - {c.heure_fin.slice(0, 5)}
                  </span>
                ))}
              </div>
            ))}
          </div>
        )}

        <Link to={`/prendre-rendezvous/${medecin.id}`} className="btn btn-primary btn-full" style={{ marginTop: "16px" }}>
          Demander un rendez-vous
        </Link>
      </div>
    </div>
  );
}

export default ProfilMedecin;