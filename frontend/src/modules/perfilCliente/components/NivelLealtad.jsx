export default function NivelLealtad({ nivelLealtad }) {
  if (!nivelLealtad) return null;

  const { nivel_actual, total_mes, descuento } = nivelLealtad;

  const niveles = [
    { nombre: "Bronce", color: "#92400e", bg: "#fef3c7", min: 0 },
    { nombre: "Plata",  color: "#475569", bg: "#f1f5f9", min: 0 },
    { nombre: "Oro",    color: "#b45309", bg: "#fffbeb", min: 0 },
  ];

  return (
    <div style={s.card}>
      <h3 style={s.title}>🏆 Mi nivel de lealtad</h3>

      {nivel_actual ? (
        <div style={s.nivelActivo}>
          <div style={s.nivelHeader}>
            <div style={s.nivelIconWrap}>
              🏆
            </div>
            <div>
              <p style={s.nivelNombre}>{nivel_actual.nombre}</p>
              <p style={s.nivelDesc}>
                Tienes <strong>{descuento}% de descuento</strong> en todos los productos
              </p>
            </div>
          </div>

          <div style={s.stats}>
            <div style={s.stat}>
              <p style={s.statLabel}>Compras este mes</p>
              <p style={s.statValor}>${Number(total_mes).toLocaleString("es-CO")}</p>
            </div>
            <div style={s.stat}>
              <p style={s.statLabel}>Tu descuento</p>
              <p style={{ ...s.statValor, color: "#0F6E56" }}>{descuento}%</p>
            </div>
            <div style={s.stat}>
              <p style={s.statLabel}>Monto mínimo</p>
              <p style={s.statValor}>${Number(nivel_actual.monto_minimo).toLocaleString("es-CO")}</p>
            </div>
          </div>

          <div style={s.infoBox}>
            <p style={s.infoText}>
              🎉 ¡Felicitaciones! Estás en el nivel <strong>{nivel_actual.nombre}</strong>.
              Cada vez que compres en esta tienda, tus precios se actualizan automáticamente.
            </p>
          </div>
        </div>
      ) : (
        <div style={s.sinNivel}>
          <span style={s.sinNivelIcon}>🥉</span>
          <p style={s.sinNivelTitle}>Aún no tienes nivel de lealtad</p>
          <p style={s.sinNivelDesc}>
            Compra <strong>${Number(0).toLocaleString("es-CO")}</strong> este mes para comenzar a obtener descuentos
          </p>
          <div style={s.totalMes}>
            <p style={s.totalMesLabel}>Tus compras este mes</p>
            <p style={s.totalMesValor}>${Number(total_mes || 0).toLocaleString("es-CO")}</p>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  card: {
    backgroundColor: "white",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  title: { fontSize: "16px", fontWeight: "700", color: "#0f172a" },
  nivelActivo: { display: "flex", flexDirection: "column", gap: "16px" },
  nivelHeader: {
    display: "flex", alignItems: "center", gap: "14px",
    padding: "16px",
    background: "linear-gradient(135deg, #0B1628, #0d2b45)",
    borderRadius: "12px",
  },
  nivelIconWrap: { fontSize: "36px", flexShrink: 0 },
  nivelNombre: { fontSize: "18px", fontWeight: "800", color: "white", marginBottom: "4px" },
  nivelDesc: { fontSize: "13px", color: "rgba(255,255,255,0.7)" },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
  },
  stat: {
    padding: "14px",
    backgroundColor: "#f8fafc",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    textAlign: "center",
  },
  statLabel: { fontSize: "11px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" },
  statValor: { fontSize: "20px", fontWeight: "800", color: "#0f172a" },
  infoBox: {
    padding: "12px 14px",
    backgroundColor: "#f0fdf4",
    borderRadius: "10px",
    border: "1px solid #bbf7d0",
  },
  infoText: { fontSize: "13px", color: "#0F6E56", lineHeight: "1.6" },
  sinNivel: {
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: "10px",
    padding: "24px", textAlign: "center",
  },
  sinNivelIcon: { fontSize: "48px" },
  sinNivelTitle: { fontSize: "15px", fontWeight: "700", color: "#0f172a" },
  sinNivelDesc: { fontSize: "13px", color: "#64748b", lineHeight: "1.6" },
  totalMes: {
    marginTop: "8px",
    padding: "14px 24px",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    textAlign: "center",
  },
  totalMesLabel: { fontSize: "12px", color: "#94a3b8", marginBottom: "4px" },
  totalMesValor: { fontSize: "24px", fontWeight: "800", color: "#0f172a" },
};