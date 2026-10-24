import { useEffect } from "react";

// Ajoute à chaque cellule d'un tableau le titre de sa colonne (attribut data-label),
// pour que le CSS puisse afficher les tableaux sous forme de cartes sur téléphone.
function etiqueter(racine) {
  racine.querySelectorAll("table").forEach((table) => {
    const titres = Array.from(table.querySelectorAll("thead th")).map((th) =>
      th.textContent.trim()
    );
    table.querySelectorAll("tbody tr").forEach((ligne) => {
      Array.from(ligne.children).forEach((cellule, i) => {
        const titre = titres[i] ?? "";
        if (cellule.getAttribute("data-label") !== titre) {
          cellule.setAttribute("data-label", titre);
        }
      });
    });
  });
}

export default function useTableauxMobile() {
  useEffect(() => {
    const racine = document.getElementById("root");
    if (!racine) return;

    etiqueter(racine);
    // Les tableaux apparaissent après le chargement des données : on surveille les ajouts
    const observateur = new MutationObserver(() => etiqueter(racine));
    observateur.observe(racine, { childList: true, subtree: true });

    return () => observateur.disconnect();
  }, []);
}