// Graphique en anneau (donut), en SVG pur, avec légende.
// segments: [{ label: string, value: number, couleur: string }]
function Donut({ segments, taille = 120, epaisseur = 16 }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const rayon = (taille - epaisseur) / 2;
  const circonference = 2 * Math.PI * rayon;

  let cumul = 0;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
      <svg width={taille} height={taille} viewBox={`0 0 ${taille} ${taille}`}>
        <g transform={`rotate(-90 ${taille / 2} ${taille / 2})`}>
          <circle cx={taille / 2} cy={taille / 2} r={rayon} fill="none" stroke="var(--bordure)" strokeWidth={epaisseur} />
          {total > 0 && segments.map((seg, i) => {
            if (seg.value === 0) return null;
            const proportion = seg.value / total;
            const longueur = proportion * circonference;
            const decalage = -cumul * circonference;
            cumul += proportion;
            return (
              <circle
                key={i}
                cx={taille / 2}
                cy={taille / 2}
                r={rayon}
                fill="none"
                stroke={seg.couleur}
                strokeWidth={epaisseur}
                strokeDasharray={`${longueur} ${circonference - longueur}`}
                strokeDashoffset={decalage}
              >
                <title>{seg.label} : {seg.value}</title>
              </circle>
            );
          })}
        </g>
        <text x="50%" y="47%" textAnchor="middle" fontSize="20" fontWeight="700" fill="var(--texte)">
          {total}
        </text>
        <text x="50%" y="61%" textAnchor="middle" fontSize="8" fill="var(--texte-secondaire)">
          au total
        </text>
      </svg>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {segments.map((seg, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
            <span style={{ width: "9px", height: "9px", borderRadius: "3px", background: seg.couleur, display: "inline-block" }} />
            <span style={{ color: "var(--texte-secondaire)" }}>{seg.label}</span>
            <span style={{ fontWeight: 700, marginLeft: "auto" }}>{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Donut;