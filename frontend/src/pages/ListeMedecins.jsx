import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";


function ListeMedecins() {
  const [medecins, setMedecins] = useState([]);
  const [specialites, setSpecialites] = useState([]);
  const [recherche, setRecherche] = useState("");
  const [specialiteChoisie, setSpecialiteChoisie] = useState("");
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    api.get("specialites/").then((res) => setSpecialites(res.data));
  }, []);

  useEffect(() => {
    setChargement(true);
    const params = {};
    if (recherche) params.recherche = recherche;
    if (specialiteChoisie) params.specialite = specialiteChoisie;

    const delai = setTimeout(() => {
      api.get("medecins/", { params }).then((res) => setMedecins(res.data)).finally(() => setChargement(false));
    }, 250);

    return () => clearTimeout(delai);
  }, [recherche, specialiteChoisie]);

  const reinitialiser = () => {
    setRecherche("");
    setSpecialiteChoisie("");
  };

  return (
    <div className="page">
      <p className="page-title">Nos médecins</p>
      <p className="page-subtitle">Trouve un médecin et prends rendez-vous en ligne.</p>

      <div className="champ-ligne" style={{ marginBottom: "12px" }}>
        <input
          type="text"
          placeholder="Rechercher par nom ou spécialité..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
        />
        <select value={specialiteChoisie} onChange={(e) => setSpecialiteChoisie(e.target.value)}>
          <option value="">Toutes les spécialités</option>
          {specialites.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
        </select>
      </div>
      {(recherche || specialiteChoisie) && (
        <button type="button" className="btn btn-outline" style={{ marginBottom: "18px" }} onClick={reinitialiser}>
          Réinitialiser la recherche
        </button>
      )}

      {chargement ? (
        <p className="etat-chargement">Chargement...</p>
      ) : medecins.length === 0 ? (
        <p className="etat-vide">Aucun médecin ne correspond à ta recherche.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "14px" }}>
          {medecins.map((m) => (
            <Link to={`/medecins/${m.id}`} key={m.id} className="card" style={{ display: "flex", flexDirection: "column", gap: "10px", color: "inherit", textDecoration: "none" }}>
              <div>
                <p style={{ fontWeight: 700, margin: 0 }}>Dr {m.nom} {m.prenom}</p>
                <p style={{ margin: "2px 0 0", fontSize: "13px", color: "var(--texte-secondaire)" }}>
                  {m.specialite_nom || "Spécialité non renseignée"}
                </p>
              </div>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--texte-secondaire)" }}>
                Consultation : {m.tarif_consultation} Ar
              </p>
              <span className="btn btn-primary btn-full" style={{ marginTop: "auto" }}>Voir le profil</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default ListeMedecins;