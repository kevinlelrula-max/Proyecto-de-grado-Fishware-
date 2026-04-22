import { useState } from "react";
import useUsuarios from "./hooks/useUsuarios";
import TablaUsuarios from "./components/TablaUsuarios";
import FormUsuario from "./components/FormUsuario";

export default function Usuarios() {
  const { usuarios, agregarUsuario } = useUsuarios();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const usuariosFiltrados = usuarios.filter((u) =>
    `${u.nombre} ${u.usuario}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  const admins = usuarios.filter((u) => u.rol_id === 1).length;
  const operadores = usuarios.filter((u) => u.rol_id !== 1).length;

  return (
    <div style={s.page}>

      {/* HEADER */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <span style={{ fontSize: "22px" }}></span>
          <h2 style={s.headerTitle}>Usuarios</h2>
        </div>
        <button style={s.btnNew} onClick={() => setMostrarForm(true)}>
          + Nuevo Usuario
        </button>
      </div>

      {/* STAT CARDS */}
      <div style={s.statsRow}>
        <div style={s.statCard}>
          <span style={s.statLabel}>Total usuarios</span>
          <span style={{ ...s.statValue, color: "#2563eb" }}>{usuarios.length}</span>
        </div>
        <div style={s.statCard}>
          <span style={s.statLabel}>Administradores</span>
          <span style={s.statValue}>{admins}</span>
        </div>
        <div style={s.statCard}>
          <span style={s.statLabel}>Operadores</span>
          <span style={s.statValue}>{operadores}</span>
        </div>
      </div>

      {/* BUSCADOR */}
      <div style={s.controls}>
        <div style={s.searchWrap}>
          <span style={s.searchIcon}>🔍</span>
          <input
            style={s.searchInput}
            placeholder="Buscar usuario por nombre o correo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <span style={s.resultCount}>
          {usuariosFiltrados.length} usuario{usuariosFiltrados.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* TABLA */}
      <TablaUsuarios usuarios={usuariosFiltrados} />

      {/* MODAL FORM */}
      {mostrarForm && (
        <div style={s.overlay} onClick={() => setMostrarForm(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitle}>Nuevo usuario</h3>
              <button style={s.modalClose} onClick={() => setMostrarForm(false)}>✕</button>
            </div>
            <FormUsuario onGuardar={(data) => { agregarUsuario(data); setMostrarForm(false); }} />
          </div>
        </div>
      )}

    </div>
  );
}

const s = {
  page: { padding: "24px" },

  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  headerLeft: { display: "flex", alignItems: "center", gap: "10px" },
  headerTitle: { fontSize: "20px", fontWeight: "700", color: "#0f172a", margin: 0 },
  btnNew: {
    padding: "9px 20px", backgroundColor: "#2563eb",
    color: "white", border: "none", borderRadius: "10px",
    cursor: "pointer", fontSize: "14px", fontWeight: "600",
  },

  statsRow: { display: "flex", gap: "12px", marginBottom: "20px" },
  statCard: {
    flex: 1, backgroundColor: "#f8fafc", borderRadius: "12px",
    padding: "12px 16px", display: "flex", flexDirection: "column", gap: "4px",
    border: "1px solid #e2e8f0",
  },
  statLabel: { fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" },
  statValue: { fontSize: "22px", fontWeight: "700", color: "#0f172a" },

  controls: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" },
  searchWrap: { flex: 1, position: "relative", display: "flex", alignItems: "center" },
  searchIcon: { position: "absolute", left: "12px", fontSize: "14px" },
  searchInput: {
    width: "100%", padding: "9px 12px 9px 34px",
    borderRadius: "10px", border: "1px solid #e2e8f0",
    fontSize: "14px", color: "#0f172a", outline: "none", backgroundColor: "#fff",
  },
  resultCount: { fontSize: "13px", color: "#94a3b8", whiteSpace: "nowrap" },

  overlay: {
    position: "fixed", inset: 0,
    backgroundColor: "rgba(15,23,42,0.5)",
    backdropFilter: "blur(4px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000, padding: "20px",
  },
  modal: {
    backgroundColor: "white", borderRadius: "16px",
    padding: "28px", width: "100%", maxWidth: "460px",
    boxShadow: "0 24px 60px rgba(0,0,0,0.2)",
  },
  modalHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: "20px",
  },
  modalTitle: { fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: 0 },
  modalClose: {
    background: "none", border: "none", fontSize: "16px",
    cursor: "pointer", color: "#94a3b8", padding: "4px",
  },
};
