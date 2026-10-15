import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";

function ProfilMedecin() {
  const { medecinId } = useParams();
  const [medecin, setMedecin] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    api.get(`medecins/${medecinId}/`).then((res) => setMedecin(res.data)).finally(() => setChargement(false));
  }, [medecinId]);

  if (chargement) return <div className="page"><p className="etat-chargement">Chargement...</p></div>;
  if (!medecin) return <div className="page"><p className="etat-erreur">Médecin introuvable.</p></div>;

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

        <Link to={`/prendre-rendezvous/${medecin.id}`} className="btn btn-primary btn-full" style={{ marginTop: "12px" }}>
          Demander un rendez-vous
        </Link>
      </div>
    </div>
  );
}

export default ProfilMedecin;