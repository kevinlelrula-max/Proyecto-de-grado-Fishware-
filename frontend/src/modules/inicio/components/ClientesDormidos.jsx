export default function ClientesDormidos({ clientes = [], onIrA }) {
  if (!clientes.length) return null;

  const diasDesde = (fecha) => {
    if (!fecha || fecha === "2000-01-01") return null;
    const diff = Date.now() - new Date(fecha).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div style={s.card}>
      <div style={s.header}>
        <div>
          <p style={s.label}>Clientes inactivos</p>
          <p style={s.sub}>Sin compras en más de 30 días</p>
        </div>
        <span style={s.badge}>{clientes.length}</span>
      </div>

      <div style={s.lista}>
        {clientes.map((c) => {
          const dias = diasDesde(c.ultima_compra);
          return (
            <div key={c.id} style={s.item}>
              <div style={s.avatar}>
                {(c.nombre?.charAt(0) || "?").toUpperCase()}
              </div>
              <div style={s.info}>
                <span style={s.nombre}>{c.nombre} {c.apellido || ""}</span>
                <span style={s.dias}>
                  {dias ? `Hace ${dias} días` : "Sin compras aún"}
                </span>
              </div>
              <button
                style={s.btnCupon}
                onClick={() => onIrA("cupones")}
                title="Crear cupón para reactivar"
              >
                🎫 Cupón
              </button>
            </div>
          );
        })}
      </div>

      <button style={s.btnVer} onClick={() => onIrA("clientes")}>
        Ver todos los clientes →
      </button>
    </div>
  );
}

const s = {
  card:   { backgroundColor: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  label:  { fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 2 },
  sub:    { fontSize: 11, color: "#94a3b8" },
  badge:  { backgroundColor: "#fef2f2", color: "#dc2626", fontSize: 13, fontWeight: 700, borderRadius: 999, padding: "3px 10px", border: "1px solid #fecaca" },
  lista:  { display: "flex", flexDirection: "column", gap: 8 },
  item:   { display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f8fafc" },
  avatar: { width: 34, height: 34, borderRadius: "50%", backgroundColor: "#f1f5f9", color: "#64748b", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  info:   { flex: 1, display: "flex", flexDirection: "column", gap: 2 },
  nombre: { fontSize: 13, fontWeight: 600, color: "#0f172a" },
  dias:   { fontSize: 11, color: "#f59e0b", fontWeight: 600 },
  btnCupon: { padding: "5px 10px", fontSize: 11, fontWeight: 700, backgroundColor: "#fffbeb", color: "#b45309", border: "1px solid #fcd34d", borderRadius: 7, cursor: "pointer", whiteSpace: "nowrap" },
  btnVer: { background: "none", border: "none", color: "#2563eb", fontSize: 12, fontWeight: 600, cursor: "pointer", padding: 0, textAlign: "left" },
};
