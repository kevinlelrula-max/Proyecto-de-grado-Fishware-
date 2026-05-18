export default function CuponCard({ cupon, onEditar, onToggle, onEliminar, onVerUsos }) {
  const esVigente = () => {
    const ahora = new Date();
    if (cupon.fecha_inicio && new Date(cupon.fecha_inicio) > ahora) return false;
    if (cupon.fecha_fin    && new Date(cupon.fecha_fin)    < ahora) return false;
    return true;
  };

  const vigente  = esVigente();
  const agotado  = cupon.usos_totales !== null && cupon.usos_actuales >= cupon.usos_totales;
  const operativo = cupon.activo && vigente && !agotado;

  const labelTipo = {
    porcentaje:  `${cupon.valor}% dto.`,
    valor_fijo:  `$${Number(cupon.valor).toLocaleString("es-CO")} dto.`,
    envio_gratis: "Envío gratis",
  }[cupon.tipo];

  const colorTipo = {
    porcentaje:   { bg: "#ede9fe", text: "#6d28d9" },
    valor_fijo:   { bg: "#dbeafe", text: "#1d4ed8" },
    envio_gratis: { bg: "#dcfce7", text: "#15803d" },
  }[cupon.tipo];

  return (
    <div style={{ ...s.card, borderColor: operativo ? "#e2e8f0" : "#f1f5f9", opacity: operativo ? 1 : 0.7 }}>

      {/* Header */}
      <div style={s.header}>
        <div style={s.codigoWrap}>
          <span style={s.codigo}>{cupon.codigo}</span>
          <span style={{ ...s.tipoBadge, backgroundColor: colorTipo.bg, color: colorTipo.text }}>
            {labelTipo}
          </span>
        </div>
        <div style={s.estadoWrap}>
          {agotado && <span style={s.badgeAgotado}>Agotado</span>}
          {!vigente && !agotado && <span style={s.badgeExpirado}>Expirado</span>}
          <div
            style={{ ...s.toggleWrap, backgroundColor: cupon.activo ? "#0F6E56" : "#e2e8f0" }}
            onClick={() => onToggle(cupon.id)}
            title={cupon.activo ? "Desactivar" : "Activar"}
          >
            <div style={{ ...s.toggleDot, left: cupon.activo ? "18px" : "3px" }} />
          </div>
        </div>
      </div>

      {/* Descripción */}
      {cupon.descripcion && (
        <p style={s.descripcion}>{cupon.descripcion}</p>
      )}

      {/* Stats */}
      <div style={s.stats}>
        <div style={s.stat}>
          <span style={s.statLabel}>Usos</span>
          <span style={s.statVal}>
            {cupon.usos_actuales}{cupon.usos_totales ? ` / ${cupon.usos_totales}` : ""}
          </span>
        </div>
        {parseFloat(cupon.minimo_compra) > 0 && (
          <div style={s.stat}>
            <span style={s.statLabel}>Mínimo</span>
            <span style={s.statVal}>${Number(cupon.minimo_compra).toLocaleString("es-CO")}</span>
          </div>
        )}
        {cupon.fecha_fin && (
          <div style={s.stat}>
            <span style={s.statLabel}>Vence</span>
            <span style={s.statVal}>{new Date(cupon.fecha_fin).toLocaleDateString("es-CO")}</span>
          </div>
        )}
        {parseFloat(cupon.total_ahorrado) > 0 && (
          <div style={s.stat}>
            <span style={s.statLabel}>Total ahorrado</span>
            <span style={{ ...s.statVal, color: "#0F6E56" }}>
              ${Number(cupon.total_ahorrado).toLocaleString("es-CO")}
            </span>
          </div>
        )}
      </div>

      {/* Acciones */}
      <div style={s.acciones}>
        <button style={s.btnUsos} onClick={() => onVerUsos(cupon)}>
          📊 Ver usos
        </button>
        <button style={s.btnEditar} onClick={() => onEditar(cupon)}>
          ✏️ Editar
        </button>
        <button style={s.btnEliminar} onClick={() => onEliminar(cupon.id)}>
          🗑️
        </button>
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
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    transition: "box-shadow 0.15s",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "10px",
  },
  codigoWrap: { display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" },
  codigo: {
    fontSize: "17px",
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: "0.05em",
    fontFamily: "'DM Mono', monospace",
  },
  tipoBadge: {
    fontSize: "11px",
    fontWeight: "700",
    padding: "3px 9px",
    borderRadius: "20px",
  },
  estadoWrap: { display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 },
  badgeAgotado: {
    fontSize: "10px", fontWeight: "700",
    backgroundColor: "#fef2f2", color: "#b91c1c",
    padding: "2px 8px", borderRadius: "20px",
  },
  badgeExpirado: {
    fontSize: "10px", fontWeight: "700",
    backgroundColor: "#f1f5f9", color: "#64748b",
    padding: "2px 8px", borderRadius: "20px",
  },
  toggleWrap: {
    width: "36px", height: "20px", borderRadius: "999px",
    position: "relative", cursor: "pointer", transition: "background 0.2s",
  },
  toggleDot: {
    position: "absolute", top: "3px",
    width: "14px", height: "14px",
    backgroundColor: "white", borderRadius: "50%",
    transition: "left 0.2s",
  },
  descripcion: { fontSize: "13px", color: "#64748b", lineHeight: "1.5", margin: 0 },
  stats: { display: "flex", flexWrap: "wrap", gap: "16px" },
  stat:  { display: "flex", flexDirection: "column", gap: "2px" },
  statLabel: { fontSize: "10px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" },
  statVal:   { fontSize: "13px", fontWeight: "700", color: "#0f172a" },
  acciones: { display: "flex", gap: "8px", paddingTop: "4px", borderTop: "1px solid #f1f5f9" },
  btnUsos: {
    flex: 1, padding: "7px 0", fontSize: "12px", fontWeight: "600",
    backgroundColor: "#f8fafc", color: "#374151",
    border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer",
  },
  btnEditar: {
    flex: 1, padding: "7px 0", fontSize: "12px", fontWeight: "600",
    backgroundColor: "#f8fafc", color: "#374151",
    border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer",
  },
  btnEliminar: {
    padding: "7px 12px", fontSize: "13px",
    backgroundColor: "#fef2f2", color: "#b91c1c",
    border: "1px solid #fecaca", borderRadius: "8px", cursor: "pointer",
  },
};
