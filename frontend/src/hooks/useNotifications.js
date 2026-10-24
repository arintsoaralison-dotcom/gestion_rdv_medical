import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";

// Renvoie le nombre de notifications non lues et le met à jour toutes les 60 secondes.
export default function useNotifications(actif) {
  const [nonLues, setNonLues] = useState(0);

  const rafraichir = useCallback(() => {
    if (!actif) return;
    api
      .get("notifications/")
      .then((res) => setNonLues(res.data.non_lues))
      .catch(() => {});
  }, [actif]);

  useEffect(() => {
    if (!actif) return;
    rafraichir();
    const minuteur = setInterval(rafraichir, 60000);
    window.addEventListener("notifications-maj", rafraichir);
    return () => {
      clearInterval(minuteur);
      window.removeEventListener("notifications-maj", rafraichir);
    };
  }, [actif, rafraichir]);

  return nonLues;
}