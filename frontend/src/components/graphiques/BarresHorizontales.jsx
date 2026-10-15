// Classement en barres horizontales (ex : rendez-vous par spécialité).
// data: [{ label: string, value: number }], triés du plus grand au plus petit par l'appelant.
function BarresHorizontales({ data, couleur = "var(--primaire)" }) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {data.map((d, i) => (
        <div key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
            <span>{d.label}</span>
            <span style={{ fontWeight: 700 }}>{d.value}</span>
          </div>
          <div style={{ background: "var(--fond)", borderRadius: "999px", height: "8px", overflow: "hidden" }}>
            <div style={{ width: `${(d.value / max) * 100}%`, background: couleur, height: "100%", borderRadius: "999px" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default BarresHorizontales;