import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const ICONES = { NOUVELLE_DEMANDE: "🆕", RAPPEL: "⏰", CONFIRMATION: "✅" };

const formaterDate = (iso) =>
  new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

function Notifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [nonLues, setNonLues] = useState(0);
  const [chargement, setChargement] = useState(true);

  // Page vers laquelle mène un clic sur une notification
  const destination = user.role === "PATIENT" ? "/mes-rendezvous" : "/dashboard-medecin";

  const charger = useCallback(() => {
    api
      .get("notifications/")
      .then((res) => {
        setNotifications(res.data.notifications);
        setNonLues(res.data.non_lues);
      })
      .finally(() => setChargement(false));
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  // Prévient le menu de rafraîchir son badge
  const prevenirMenu = () => window.dispatchEvent(new Event("notifications-maj"));

  const toutLire = async () => {
    await api.post("notifications/tout-lire/");
    charger();
    prevenirMenu();
  };

  const ouvrir = async (n) => {
    if (!n.lue) {
      await api.post(`notifications/${n.id}/lire/`);
      prevenirMenu();
    }
    navigate(destination);
  };

  return (
    <div className="page">
      <div
        className="page-entete-fixe"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
      >
        <div>
          <p className="page-title">Notifications</p>
          <p className="page-subtitle">
            {nonLues > 0
              ? `${nonLues} non lue${nonLues > 1 ? "s" : ""}`
              : "Tout est à jour."}
          </p>
        </div>
        {nonLues > 0 && (
          <button className="btn btn-outline" onClick={toutLire}>
            Tout marquer comme lu
          </button>
        )}
      </div>

      {chargement ? (
        <p className="etat-chargement">Chargement...</p>
      ) : notifications.length === 0 ? (
        <div className="card">
          <p className="etat-vide">Aucune notification pour le moment.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {notifications.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => ouvrir(n)}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                width: "100%",
                textAlign: "left",
                padding: "14px",
                cursor: "pointer",
                fontFamily: "inherit",
                color: "var(--texte)",
                background: n.lue ? "var(--surface)" : "var(--primaire-clair)",
                border: "1px solid var(--bordure)",
                borderLeft: n.lue ? "1px solid var(--bordure)" : "4px solid var(--primaire)",
                borderRadius: "var(--rayon)",
              }}
            >
              <span style={{ fontSize: "20px" }}>{ICONES[n.type] || "🔔"}</span>
              <span style={{ flex: 1 }}>
                <span style={{ display: "block", fontSize: "14px", fontWeight: n.lue ? 400 : 600 }}>
                  {n.message}
                </span>
                <span style={{ display: "block", fontSize: "12px", color: "var(--texte-secondaire)", marginTop: "4px" }}>
                  {formaterDate(n.date_creation)}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;