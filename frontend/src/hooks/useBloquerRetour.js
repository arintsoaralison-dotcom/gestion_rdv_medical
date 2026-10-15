import { useEffect } from "react";

export default function useBloquerRetour(actif = true) {
  useEffect(() => {
    if (!actif) return;

    // 1) On ajoute une entrée d'historique : "Précédent" la consomme
    const verrouiller = () => {
      window.history.pushState(window.history.state, "", window.location.href);
      console.log("[retour] entrée ajoutée, history.length =", window.history.length);
    };

    console.log(
      "[retour] hook actif, activation utilisateur :",
      navigator.userActivation?.hasBeenActive
    );

    verrouiller();

    const surRetour = () => {
      console.log("[retour] popstate détecté");
      verrouiller();
    };
    window.addEventListener("popstate", surRetour);

    // 2) Sécurité : si Chrome quitte quand même l'application,
    //    il demande confirmation et "Annuler" laisse sur le tableau de bord
    const avertir = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", avertir);

    return () => {
      window.removeEventListener("popstate", surRetour);
      window.removeEventListener("beforeunload", avertir);
    };
  }, [actif]);
}