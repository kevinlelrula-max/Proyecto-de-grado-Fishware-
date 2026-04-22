const ROLES = {
  1: { label: "Administrador", color: "#1d4ed8", bg: "#eff6ff" },
  2: { label: "Operador",      color: "#0F6E56", bg: "#E1F5EE" },
  3: { label: "Vendedor",      color: "#b45309", bg: "#fffbeb" },
  4: { label: "Supervisor",    color: "#7c3aed", bg: "#f5f3ff" },
};

export default function TablaUsuarios({ usuarios }) {
  if (usuarios.length === 0) {
    return (
      <div style={s.empty}>
        <span style={{ fontSize: "36px", display: "block", marginBottom: "10px" }}>🧑‍💼</span>
        <p style={{ fontSize: "14px", color: "#94a3b8" }}>No se encontraron usuarios</p>
      </div>
    );
  }

  return (
    <div style={s.wrapper}>
      <table style={s.table}>
        <thead>
          <tr>
            <th style={s.th}>Usuario</th>
            <th style={s.th}>Correo</th>
            <th style={s.th}>Rol</th>
            <th style={{ ...s.th, textAlign: "center" }}>Estado</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => {
            const rol = ROLES[u.rol_id] || { label: `Rol ${u.rol_id}`, color: "#64748b", bg: "#f1f5f9" };
            return (
              <tr key={u.id} style={s.row}>

                {/* Usuario con avatar */}
                <td style={s.td}>
                  <div style={s.userWrap}>
                    <div style={{ ...s.avatar, backgroundColor: rol.bg, color: rol.color }}>
                      {u.nombre?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <span style={s.nombre}>{u.nombre}</span>
                  </div>
                </td>

                {/* Correo */}
                <td style={s.td}>
                  <span style={s.correo}>{u.usuario}</span>
                </td>

                {/* Rol */}
                <td style={s.td}>
                  <span style={{ ...s.rolBadge, backgroundColor: rol.bg, color: rol.color }}>
                    {rol.label}
                  </span>
                </td>

                {/* Estado */}
                <td style={{ ...s.td, textAlign: "center" }}>
                  <span style={s.activoBadge}>● Activo</span>
                </td>

              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const s = {
  wrapper: {
    backgroundColor: "white", borderRadius: "14px",
    border: "1px solid #e2e8f0", overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "13px 16px", textAlign: "left",
    fontSize: "11px", fontWeight: "700", color: "#94a3b8",
    textTransform: "uppercase", letterSpacing: "0.05em",
    backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0",
  },
  row: { borderBottom: "1px solid #f1f5f9" },
  td: { padding: "14px 16px", fontSize: "14px", color: "#334155" },

  userWrap: { display: "flex", alignItems: "center", gap: "10px" },
  avatar: {
    width: "34px", height: "34px", borderRadius: "50%",
    fontSize: "13px", fontWeight: "700",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  nombre: { fontWeight: "600", color: "#0f172a" },
  correo: { fontSize: "13px", color: "#64748b" },

  rolBadge: {
    display: "inline-block", padding: "4px 12px",
    borderRadius: "999px", fontSize: "12px", fontWeight: "600",
  },
  activoBadge: {
    display: "inline-block", fontSize: "12px",
    fontWeight: "600", color: "#0F6E56",
  },

  empty: { textAlign: "center", padding: "48px 20px" },
};
