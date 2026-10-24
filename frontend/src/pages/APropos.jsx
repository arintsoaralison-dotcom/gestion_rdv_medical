const COULEURS = {
  compte: { fond: "var(--violet-clair)", trait: "var(--violet)" },
  metier: { fond: "var(--bleu-clair)", trait: "var(--bleu)" },
};

const LARGEUR = 170;

const TABLES = [
  {
    nom: "PATIENT", x: 30, y: 40, type: "metier",
    attributs: [{ n: "id", pk: true }, { n: "#utilisateur_id" }, { n: "date_naissance" }, { n: "adresse" }],
  },
  {
    nom: "UTILISATEUR", x: 260, y: 40, type: "compte",
    attributs: [
      { n: "id", pk: true }, { n: "username" }, { n: "password" }, { n: "first_name" },
      { n: "last_name" }, { n: "email" }, { n: "role" }, { n: "telephone" },
      { n: "is_active" }, { n: "is_staff" }, { n: "is_superuser" },
      { n: "date_joined" }, { n: "last_login" },
    ],
  },
  {
    nom: "SPECIALITE", x: 490, y: 40, type: "metier",
    attributs: [{ n: "id", pk: true }, { n: "nom" }],
  },
  {
    nom: "MEDECIN", x: 490, y: 170, type: "metier",
    attributs: [
      { n: "id", pk: true }, { n: "#utilisateur_id" }, { n: "#specialite_id" },
      { n: "numero_licence" }, { n: "tarif_consultation" }, { n: "bio" },
    ],
  },
  {
    nom: "DISPONIBILITE", x: 490, y: 370, type: "metier",
    attributs: [
      { n: "id", pk: true }, { n: "#medecin_id" }, { n: "jour" },
      { n: "heure_debut" }, { n: "heure_fin" },
    ],
  },
  {
    nom: "RENDEZ_VOUS", x: 260, y: 360, type: "metier",
    attributs: [
      { n: "id", pk: true }, { n: "#patient_id" }, { n: "#medecin_id" }, { n: "date" },
      { n: "heure" }, { n: "motif" }, { n: "statut" }, { n: "date_creation" },
    ],
  },
];

const LIAISONS = [
  "M200 90H260",
  "M430 220H490",
  "M575 114V170",
  "M575 316V370",
  "M115 150V450H260",
  "M490 290H460V450H430",
];

const MULTIPLICITES = [
  { t: "0..1", x: 204, y: 82 },
  { t: "1", x: 256, y: 82, fin: true },
  { t: "1", x: 434, y: 212 },
  { t: "0..1", x: 486, y: 212, fin: true },
  { t: "0..1", x: 582, y: 130 },
  { t: "0..*", x: 582, y: 164 },
  { t: "1", x: 582, y: 332 },
  { t: "0..*", x: 582, y: 364 },
  { t: "1", x: 122, y: 168 },
  { t: "0..*", x: 254, y: 468, fin: true },
  { t: "1", x: 486, y: 282, fin: true },
  { t: "0..*", x: 436, y: 468 },
];

function APropos() {
  return (
    <div className="page">
      <div className="page-entete-fixe">
        <p className="page-title">À propos</p>
        <p className="page-subtitle">Présentation de l'application et de sa base de données.</p>
      </div>

      <div className="card" style={{ marginBottom: "20px" }}>
        <p style={{ fontWeight: 700, marginBottom: "4px" }}>RDV Médical</p>
        <p style={{ fontSize: "14px", color: "var(--texte-secondaire)", marginBottom: "6px" }}>
          Application web de gestion de rendez-vous médicaux, avec trois profils : patient, médecin et administrateur.
        </p>
        <p style={{ fontSize: "14px", color: "var(--texte-secondaire)" }}>
          Technologies : Django et Django REST Framework pour l'API, React avec Vite pour l'interface, hébergement sur Render.
        </p>
      </div>

      <div className="card">
        <p style={{ fontWeight: 700, marginBottom: "4px" }}>Modèle physique de données (MPD)</p>
        <p style={{ fontSize: "13px", color: "var(--texte-secondaire)", marginBottom: "14px" }}>
          Six tables reliées par des clés étrangères. Chaque multiplicité est écrite à côté de la table qu'elle décrit.
        </p>

        <div style={{ overflowX: "auto" }}>
          <svg
            viewBox="0 0 680 596"
            role="img"
            aria-label="Modèle physique de données : six tables reliées par des clés étrangères"
            style={{ width: "100%", minWidth: "640px", maxWidth: "900px", height: "auto", display: "block", margin: "0 auto" }}
          >
            {LIAISONS.map((d) => (
              <path key={d} d={d} fill="none" stroke="var(--texte-secondaire)" strokeWidth="1.2" />
            ))}

            {TABLES.map((t) => {
              const hauteur = 28 + t.attributs.length * 18 + 10;
              const c = COULEURS[t.type];
              return (
                <g key={t.nom}>
                  <rect x={t.x} y={t.y} width={LARGEUR} height={hauteur} rx="4" fill="var(--surface)" stroke={c.trait} strokeWidth="0.8" />
                  <rect x={t.x} y={t.y} width={LARGEUR} height="28" rx="4" fill={c.fond} stroke={c.trait} strokeWidth="0.8" />
                  <text
                    x={t.x + LARGEUR / 2}
                    y={t.y + 14}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="14"
                    fontWeight="700"
                    fill="var(--texte)"
                  >
                    {t.nom}
                  </text>
                  {t.attributs.map((a, i) => (
                    <text
                      key={a.n}
                      x={t.x + 12}
                      y={t.y + 42 + i * 18}
                      dominantBaseline="central"
                      fontSize="12"
                      fill="var(--texte)"
                      textDecoration={a.pk ? "underline" : undefined}
                    >
                      {a.n}
                    </text>
                  ))}
                </g>
              );
            })}

            {MULTIPLICITES.map((m, i) => (
              <text
                key={i}
                x={m.x}
                y={m.y}
                fontSize="12"
                fontWeight="600"
                fill="var(--texte-secondaire)"
                textAnchor={m.fin ? "end" : "start"}
              >
                {m.t}
              </text>
            ))}

            <rect x="30" y="564" width="12" height="12" rx="2" fill={COULEURS.compte.fond} stroke={COULEURS.compte.trait} strokeWidth="0.8" />
            <text x="50" y="570" dominantBaseline="central" fontSize="12" fill="var(--texte-secondaire)">Compte</text>
            <rect x="120" y="564" width="12" height="12" rx="2" fill={COULEURS.metier.fond} stroke={COULEURS.metier.trait} strokeWidth="0.8" />
            <text x="140" y="570" dominantBaseline="central" fontSize="12" fill="var(--texte-secondaire)">Données métier</text>
            <text x="270" y="570" dominantBaseline="central" fontSize="12" fill="var(--texte-secondaire)">
              Souligné : clé primaire · # : clé étrangère
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
}

export default APropos;