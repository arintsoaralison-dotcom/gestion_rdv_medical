import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function MonProfil() {
  const { user } = useAuth();
  const [compte, setCompte] = useState(null);
  const [profilId, setProfilId] = useState(null);
  const [specialites, setSpecialites] = useState([]);
  const [form, setForm] = useState({
    email: "", first_name: "", last_name: "", telephone: "",
    date_naissance: "", adresse: "",
    specialite: "", tarif_consultation: "", bio: "",
  });
  const [chargement, setChargement] = useState(true);
  const [envoi, setEnvoi] = useState(false);
  const [message, setMessage] = useState(null);
  const [dateVerrouillee, setDateVerrouillee] = useState(false);

  useEffect(() => {
    const requetes = [api.get("comptes/mon-profil/")];
    if (user.role === "PATIENT") requetes.push(api.get("patients/"));
    if (user.role === "MEDECIN") {
      requetes.push(api.get("medecins/"));
      requetes.push(api.get("specialites/"));
    }

    Promise.all(requetes).then((resultats) => {
      const [resCompte, resProfil, resSpecialites] = resultats;
      setCompte(resCompte.data);

      const base = {
        email: resCompte.data.email || "",
        first_name: resCompte.data.first_name || "",
        last_name: resCompte.data.last_name || "",
        telephone: resCompte.data.telephone || "",
      };

      if (user.role === "PATIENT" && resProfil?.data?.[0]) {
        const p = resProfil.data[0];
        setProfilId(p.id);
        setDateVerrouillee(Boolean(p.date_naissance));
        setForm({ ...base, date_naissance: p.date_naissance || "", adresse: p.adresse || "", specialite: "", tarif_consultation: "", bio: "" });
      } else if (user.role === "MEDECIN" && resProfil?.data) {
        const m = resProfil.data.find((d) => d.utilisateur === user.id);
        if (m) {
          setProfilId(m.id);
          setForm({ ...base, date_naissance: "", adresse: "", specialite: m.specialite || "", tarif_consultation: m.tarif_consultation || "", bio: m.bio || "" });
        }
        setSpecialites(resSpecialites.data);
      } else {
        setForm({ ...base, date_naissance: "", adresse: "", specialite: "", tarif_consultation: "", bio: "" });
      }
    }).finally(() => setChargement(false));
  }, [user]);

  const majChamp = (champ) => (e) => setForm({ ...form, [champ]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnvoi(true);
    setMessage(null);
    try {
      await api.patch("comptes/mon-profil/", {
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
        telephone: form.telephone,
      });

      if (user.role === "PATIENT" && profilId) {
        const donneesPatient = { adresse: form.adresse };
        if (!dateVerrouillee) {
          donneesPatient.date_naissance = form.date_naissance || null;
        }
        const res = await api.patch(`patients/${profilId}/`, donneesPatient);
        if (res.data?.date_naissance) {
          setDateVerrouillee(true);
        }
      }

      if (user.role === "MEDECIN" && profilId) {
        await api.patch(`medecins/${profilId}/`, {
          specialite: form.specialite || null,
          tarif_consultation: form.tarif_consultation,
          bio: form.bio,
        });
      }

      setMessage({ type: "success", texte: "Profil mis à jour avec succès." });
    } catch (err) {
      setMessage({ type: "error", texte: "Impossible de mettre à jour le profil." });
    } finally {
      setEnvoi(false);
    }
  };

  if (chargement) {
    return <div className="page"><p style={{ color: "var(--texte-secondaire)" }}>Chargement...</p></div>;
  }

  return (
    <div className="page page-centree">
      <div className="page-entete-fixe">
        <p className="page-title">Mon profil</p>
        <p className="page-subtitle">Modifie tes informations personnelles.</p>
      </div>


      <div className="card carte-formulaire">
        {message && (
          <p className={message.type === "success" ? "auth-succes" : "auth-erreur"}>{message.texte}</p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="champ-ligne">
            <div>
              <label htmlFor="first_name">Prénom</label>
              <input id="first_name" value={form.first_name} onChange={majChamp("first_name")} required />
            </div>
            <div>
              <label htmlFor="last_name">Nom</label>
              <input id="last_name" value={form.last_name} onChange={majChamp("last_name")} required />
            </div>
          </div>

          <label>Nom d'utilisateur</label>
          <input value={compte?.username || ""} disabled style={{ opacity: 0.6 }} />

          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={form.email} onChange={majChamp("email")} required />

          <label htmlFor="telephone">Téléphone</label>
          <input id="telephone" value={form.telephone} onChange={majChamp("telephone")} />

          {user.role === "PATIENT" && (
            <>
              <label htmlFor="date_naissance">Date de naissance</label>
              <input
                id="date_naissance"
                type="date"
                value={form.date_naissance}
                onChange={majChamp("date_naissance")}
                disabled={dateVerrouillee}
                style={dateVerrouillee ? { opacity: 0.6 } : undefined}
              />

              <label htmlFor="adresse">Adresse</label>
              <input id="adresse" value={form.adresse} onChange={majChamp("adresse")} />
            </>
          )}

          {user.role === "MEDECIN" && (
            <>
              <label htmlFor="specialite">Spécialité</label>
              <select id="specialite" value={form.specialite} onChange={majChamp("specialite")}>
                <option value="">-- Choisir --</option>
                {specialites.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
              </select>

              <label htmlFor="tarif_consultation">Tarif consultation</label>
              <input id="tarif_consultation" type="number" step="0.01" value={form.tarif_consultation} onChange={majChamp("tarif_consultation")} />

              <label htmlFor="bio">Bio</label>
              <textarea id="bio" rows="3" value={form.bio} onChange={majChamp("bio")} />
            </>
          )}

          <button type="submit" className="btn btn-primary btn-full" disabled={envoi}>
            {envoi ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default MonProfil;