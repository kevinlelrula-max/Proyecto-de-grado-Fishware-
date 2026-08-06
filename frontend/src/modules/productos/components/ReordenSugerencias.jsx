export default function ReordenSugerencias({ sugerencias }) {
  if (!sugerencias || sugerencias.length === 0) return null;

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div style={s.headerLeft}>
          <h3 style={s.title}>🔁 Sugerencias de reorden</h3>
          <span style={s.badge}>{sugerencias.length} producto{sugerencias.length !== 1 ? "s" : ""}</span>
        </div>
        <p style={s.hint}>Basado en ventas de los últimos 30 días · cobertura sugerida: 7 días</p>
      </div>

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Producto</th>
              <th style={{ ...s.th, textAlign: "center" }}>Stock actual</th>
              <th style={{ ...s.th, textAlign: "center" }}>Promedio/día</th>
              <th style={{ ...s.th, textAlign: "center" }}>Pedir ahora</th>
            </tr>
          </thead>
          <tbody>
            {sugerencias.map((p, i) => {
              const sinMovimiento = parseFloat(p.promedio_diario) === 0;
              return (
                <tr key={p.id} style={i % 2 === 0 ? s.rowEven : s.rowOdd}>
                  <td style={s.tdNombre}>{p.nombre}</td>
                  <td style={s.tdCenter}>
                    <span style={{ ...s.pill, backgroundColor: "#fef2f2", color: "#dc2626" }}>
                      {Number(p.stock).toFixed(1)} {p.unidad || "uds."}
                    </span>
                  </td>
                  <td style={s.tdCenter}>
                    {sinMovimiento ? (
                      <span style={s.sinMov}>Sin ventas</span>
                    ) : (
                      <span style={s.avgVal}>
                        {Number(p.promedio_diario).toFixed(2)} {p.unidad || "uds."}
                      </span>
                    )}
                  </td>
                  <td style={s.tdCenter}>
                    {sinMovimiento ? (
                      <span style={{ ...s.pill, backgroundColor: "#f1f5f9", color: "#94a3b8" }}>
                        —
                      </span>
                    ) : (
                      <span style={{ ...s.pill, backgroundColor: "#E1F5EE", color: "#0F6E56", fontWeight: "700" }}>
                        {Number(p.cantidad_sugerida).toFixed(1)} {p.unidad || "uds."}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p style={s.formula}>
        Fórmula: (promedio diario × 7 días) − stock actual
      </p>
    </div>
  );
}

const s = {
  wrap: {
    backgroundColor: "white",
    borderRadius: "16px",
    border: "1.5px solid #d1fae5",
    overflow: "hidden",
  },
  header: {
    padding: "16px 20px 12px",
    backgroundColor: "#f0fdf4",
    borderBottom: "1px solid #d1fae5",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "4px",
  },
  title: { fontSize: "14px", fontWeight: "700", color: "#166534", margin: 0 },
  badge: {
    padding: "2px 10px",
    backgroundColor: "#bbf7d0",
    color: "#166534",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: "700",
  },
  hint: { fontSize: "11px", color: "#16a34a", margin: 0 },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "10px 16px",
    fontSize: "11px",
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    textAlign: "left",
    backgroundColor: "#fafafa",
    borderBottom: "1px solid #f0f0f0",
  },
  rowEven: { backgroundColor: "white" },
  rowOdd:  { backgroundColor: "#fafeff" },
  tdNombre: {
    padding: "11px 16px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#0f172a",
    borderBottom: "1px solid #f8fafc",
  },
  tdCenter: {
    padding: "11px 16px",
    textAlign: "center",
    fontSize: "13px",
    color: "#374151",
    borderBottom: "1px solid #f8fafc",
  },
  pill: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
  },
  avgVal: {
    fontSize: "12px",
    color: "#0f172a",
    fontWeight: "600",
  },
  sinMov: {
    fontSize: "11px",
    color: "#94a3b8",
    fontStyle: "italic",
  },
  formula: {
    fontSize: "10px",
    color: "#94a3b8",
    textAlign: "right",
    padding: "8px 16px",
    margin: 0,
    borderTop: "1px solid #f0f0f0",
    fontStyle: "italic",
  },
};
