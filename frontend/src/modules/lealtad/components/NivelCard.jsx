export default function NivelCard({ nivel, onEditar, onEliminar, onToggle }) {
  const iconos = ["🥉", "🥈", "🥇", "💎", "👑"];
  const colores = [
    { bg: "#fef3c7", color: "#92400e", border: "#fde68a" }, // bronce
    { bg: "#f1f5f9", color: "#475569", border: "#cbd5e1" }, // plata
    { bg: "#fffbeb", color: "#b45309", border: "#fcd34d" }, // oro
    { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" }, // diamante
    { bg: "#fdf4ff", color: "#7e22ce", border: "#e9d5ff" }, // platino
  ];

  // Asignar color e icono según índice o nombre
  const nombres = ["bronce", "plata", "oro", "diamante", "platino"];
  const idx = nombres.findIndex(n => nivel.nombre.toLowerCase().includes(n));
  const colorIdx = idx >= 0 ? idx : 0;
  const { bg, color, border } = colores[colorIdx];
  const icono = iconos[colorIdx];

  return (
    <div style={{
      ...s.card,
      borderColor: nivel.activo ? border : "#e2e8f0",
      opacity: nivel.activo ? 1 : 0.6,
    }}>
      {/* Header */}
      <div style={s.header}>
        <div style={{ ...s.iconWrap, backgroundColor: bg, color }}>
          {icono}
        </div>
        <div style={s.info}>
          <p style={{ ...s.nombre, color }}>{nivel.nombre}</p>
          <p style={s.estado}>
            {nivel.activo ? "✓ Activo" : "Inactivo"}
          </p>
        </div>
        <div style={s.actions}>
          <button style={s.btnToggle} onClick={() => onToggle(nivel)} title={nivel.activo ? "Desactivar" : "Activar"}>
            {nivel.activo ? "⏸" : "▶"}
          </button>
          <button style={s.btnEditar} onClick={() => onEditar(nivel)}>
            ✏️
          </button>
          <button style={s.btnEliminar} onClick={() => onEliminar(nivel.id)}>
            🗑️
          </button>
        </div>
      </div>

      {/* Detalles */}
      <div style={s.detalles}>
        <div style={s.detalle}>
          <span style={s.detalleLabel}>Compras mínimas del mes</span>
          <span style={{ ...s.detalleValor, color }}>
            ${Number(nivel.monto_minimo).toLocaleString("es-CO")}
          </span>
        </div>
        <div style={s.separador} />
        <div style={s.detalle}>
          <span style={s.detalleLabel}>Descuento aplicado</span>
          <span style={{ ...s.detalleValor, color }}>
            {nivel.descuento_porcentaje}%
          </span>
        </div>
      </div>

      {/* Ejemplo visual */}
      <div style={{ ...s.ejemplo, backgroundColor: bg, borderColor: border }}>
        <span style={s.ejemploLabel}>Ejemplo:</span>
        <span style={s.ejemploTexto}>
          Producto de $100.000 →{" "}
          <strong style={{ color }}>
            ${(100000 * (1 - nivel.descuento_porcentaje / 100)).toLocaleString("es-CO")}
          </strong>
        </span>
      </div>
    </div>
  );
}

const s = {
  card: {
    backgroundColor: "white",
    borderRadius: "14px",
    border: "1.5px solid",
    padding: "18px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    transition: "all 0.2s",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  iconWrap: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    fontSize: "22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  info: { flex: 1 },
  nombre: {
    fontSize: "15px",
    fontWeight: "700",
    marginBottom: "2px",
  },
  estado: {
    fontSize: "11px",
    color: "#94a3b8",
  },
  actions: {
    display: "flex",
    gap: "6px",
  },
  btnToggle: {
    background: "none",
    border: "1px solid #e2e8f0",
    borderRadius: "7px",
    padding: "5px 8px",
    cursor: "pointer",
    fontSize: "13px",
  },
  btnEditar: {
    background: "none",
    border: "1px solid #e2e8f0",
    borderRadius: "7px",
    padding: "5px 8px",
    cursor: "pointer",
    fontSize: "13px",
  },
  btnEliminar: {
    background: "none",
    border: "1px solid #fecaca",
    borderRadius: "7px",
    padding: "5px 8px",
    cursor: "pointer",
    fontSize: "13px",
  },
  detalles: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 14px",
    backgroundColor: "#f8fafc",
    borderRadius: "10px",
  },
  detalle: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  detalleLabel: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  detalleValor: {
    fontSize: "18px",
    fontWeight: "800",
  },
  separador: {
    width: "1px",
    height: "36px",
    backgroundColor: "#e2e8f0",
    flexShrink: 0,
  },
  ejemplo: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
  },
  ejemploLabel: {
    fontWeight: "600",
    color: "#64748b",
    flexShrink: 0,
  },
  ejemploTexto: {
    color: "#64748b",
  },
};