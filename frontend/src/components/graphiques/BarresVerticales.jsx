// Petit graphique en barres verticales, en SVG pur (sans dépendance externe).
// data: [{ label: string, value: number }]
function BarresVerticales({ data, couleur = "var(--primaire)", hauteur = 140 }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const largeurBarre = 100 / data.length;

  return (
    <div>
      <svg viewBox={`0 0 100 ${hauteur}`} preserveAspectRatio="none" style={{ width: "100%", height: `${hauteur}px`, overflow: "visible" }}>
        {data.map((d, i) => {
          const h = (d.value / max) * (hauteur - 20);
          const x = i * largeurBarre + largeurBarre * 0.2;
          const largeur = largeurBarre * 0.6;
          return (
            <g key={i}>
              <rect
                x={x}
                y={hauteur - 20 - h}
                width={largeur}
                height={h}
                rx="1.5"
                fill={couleur}
              >
                <title>{d.label} : {d.value}</title>
              </rect>
              {d.value > 0 && (
                <text
                  x={x + largeur / 2}
                  y={hauteur - 22 - h}
                  fontSize="6"
                  textAnchor="middle"
                  fill="var(--texte-secondaire)"
                >
                  {d.value}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div style={{ display: "flex", marginTop: "4px" }}>
        {data.map((d, i) => (
          <div key={i} style={{ width: `${largeurBarre}%`, textAlign: "center", fontSize: "10px", color: "var(--texte-secondaire)" }}>
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default BarresVerticales;