import { useState } from "react";
import { Pencil, Pause, Play, Trash2, Users } from "lucide-react";

const ROLES = {
  1: { label: "SuperAdmin",    color: "#dc2626", bg: "#fef2f2" },
  2: { label: "Administrador", color: "#1d4ed8", bg: "#eff6ff" },
  3: { label: "Empleado",      color: "#15803d", bg: "#f0fdf4" },
  4: { label: "Cliente",       color: "#7c3aed", bg: "#f5f3ff" },
};

export default function TablaUsuarios({ usuarios, onEditar, onToggle, onEliminar }) {
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  if (usuarios.length === 0) {
    return (
      <div style={s.empty}>
        <div style={s.emptyIconWrap}>
          <Users size={28} color="#94a3b8" />
        </div>
        <p style={s.emptyText}>No se encontraron usuarios</p>
      </div>
    );
  }

  return (
    <div style={s.wrapper}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ ...s.table, minWidth: "640px" }}>
          <thead>
            <tr>
              <th style={s.th}>Usuario</th>
              <th style={s.th}>Nombre de usuario</th>
              <th style={s.th}>Rol</th>
              <th style={{ ...s.th, textAlign: "center" }}>Estado</th>
              <th style={{ ...s.th, textAlign: "center" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => {
              const rol    = ROLES[u.rol_id] || { label: u.rol_nombre || `Rol ${u.rol_id}`, color: "#64748b", bg: "#f1f5f9" };
              const activo = u.activo !== false;
              return (
                <tr key={u.id} style={{ ...s.row, opacity: activo ? 1 : 0.55 }}>

                  {/* Avatar + nombre */}
                  <td style={s.td}>
                    <div style={s.userWrap}>
                      <div style={{ ...s.avatar, backgroundColor: rol.bg, color: rol.color }}>
                        {u.nombre?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div>
                        <div style={s.nombre}>{u.nombre} {u.apellido}</div>
                        <div style={s.telefono}>{u.telefono || "—"}</div>
                      </div>
                    </div>
                  </td>

                  {/* Usuario */}
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
                    <span style={{ ...s.estadoBadge, ...(activo ? s.activo : s.inactivo) }}>
                      ● {activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td style={{ ...s.td, textAlign: "center" }}>
                    <div style={s.actions}>
                      {pendingDeleteId === u.id ? (
                        <>
                          <span style={s.confirmText}>¿Eliminar?</span>
                          <button style={s.btnConfirmYes} onClick={() => { onEliminar(u.id); setPendingDeleteId(null); }}>Sí</button>
                          <button style={s.btnConfirmNo} onClick={() => setPendingDeleteId(null)}>No</button>
                        </>
                      ) : (
                        <>
                          <button style={s.btnAction} onClick={() => onEditar(u)} title="Editar">
                            <Pencil size={14} color="#2563eb" />
                          </button>
                          <button
                            style={{ ...s.btnAction, ...(activo ? s.btnDesactivar : s.btnActivar) }}
                            onClick={() => onToggle(u.id)}
                            title={activo ? "Desactivar" : "Activar"}
                          >
                            {activo
                              ? <Pause size={14} color="#c2410c" />
                              : <Play size={14} color="#15803d" />
                            }
                          </button>
                          <button style={{ ...s.btnAction, ...s.btnDeleteStyle }} onClick={() => setPendingDeleteId(u.id)} title="Eliminar">
                            <Trash2 size={14} color="#dc2626" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const s = {
  wrapper: {
    backgroundColor: "white", borderRadius: "14px",
    border: "1px solid #e2e8f0", overflow: "hidden",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "13px 16px", textAlign: "left",
    fontSize: "11px", fontWeight: "700", color: "#94a3b8",
    textTransform: "uppercase", letterSpacing: "0.05em",
    backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0",
  },
  row: { borderBottom: "1px solid #f1f5f9", transition: "background 0.1s" },
  td: { padding: "14px 16px", fontSize: "14px", color: "#334155" },

  userWrap: { display: "flex", alignItems: "center", gap: "10px" },
  avatar: {
    width: "36px", height: "36px", borderRadius: "50%",
    fontSize: "14px", fontWeight: "700",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  nombre:  { fontWeight: "600", color: "#0f172a", fontSize: "13px" },
  telefono:{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" },
  correo:  { fontSize: "13px", color: "#64748b" },

  rolBadge: {
    display: "inline-block", padding: "4px 12px",
    borderRadius: "999px", fontSize: "12px", fontWeight: "600",
  },
  estadoBadge: {
    display: "inline-block", fontSize: "12px", fontWeight: "600",
    padding: "3px 10px", borderRadius: "999px",
  },
  activo:  { color: "#15803d", background: "#f0fdf4" },
  inactivo:{ color: "#94a3b8", background: "#f1f5f9" },

  actions: { display: "flex", gap: "6px", justifyContent: "center" },
  btnAction: {
    width: "30px", height: "30px",
    display: "flex", alignItems: "center", justifyContent: "center",
    border: "1px solid #e2e8f0", borderRadius: "8px",
    backgroundColor: "#f8fafc", cursor: "pointer",
    transition: "background 0.12s",
  },
  btnDesactivar: { backgroundColor: "#fff7ed", borderColor: "#fed7aa" },
  btnActivar:    { backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" },
  btnDeleteStyle:{ backgroundColor: "#fef2f2", borderColor: "#fecaca" },

  empty: { textAlign: "center", padding: "48px 20px" },
  emptyIconWrap: {
    width: "60px", height: "60px", borderRadius: "50%",
    backgroundColor: "#f1f5f9",
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: "0 auto 12px",
  },
  emptyText: { fontSize: "14px", color: "#94a3b8", margin: 0 },

  confirmText: { fontSize: "12px", color: "#dc2626", fontWeight: "600", whiteSpace: "nowrap" },
  btnConfirmYes: {
    padding: "5px 10px", fontSize: "12px", fontWeight: "700",
    backgroundColor: "#dc2626", color: "white",
    border: "none", borderRadius: "7px", cursor: "pointer",
  },
  btnConfirmNo: {
    padding: "5px 10px", fontSize: "12px", fontWeight: "600",
    backgroundColor: "#f1f5f9", color: "#64748b",
    border: "1px solid #e2e8f0", borderRadius: "7px", cursor: "pointer",
  },
};
