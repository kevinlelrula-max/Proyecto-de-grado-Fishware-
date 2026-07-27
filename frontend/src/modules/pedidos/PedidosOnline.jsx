import { useState } from "react";
import { usePedidosAdmin, ESTADOS } from "./hooks/usePedidosAdmin";
import PedidoCardAdmin from "./components/PedidoCardAdmin";
import EnvioConfig from "../envio/EnvioConfig"; // 1️⃣ import

const TABS = [
  { key: "pedidos", label: "📦 Pedidos" },
  { key: "envio",   label: "🚚 Configuración de envío" },
];

export default function PedidosOnline() {
  const { pedidos, loading, error, cambiando, conteos, fetchPedidos, cambiarEstado, notifPermiso, pedirPermiso } = usePedidosAdmin();
  const [filtro,    setFiltro]    = useState("todos");
  const [busqueda,  setBusqueda]  = useState("");
  const [tabActiva, setTabActiva] = useState("pedidos"); // 2️⃣ estado de tab

  const pedidosFiltrados = pedidos
    .filter(p => filtro === "todos" || p.estado === filtro)
    .filter(p => {
      if (!busqueda) return true;
      const q = busqueda.toLowerCase();
      return (
        String(p.id).includes(q) ||
        p.cliente_nombre?.toLowerCase().includes(q) ||
        p.cliente_apellido?.toLowerCase().includes(q)
      );
    });

  return (
    <div style={s.wrap} className="pedidos-wrap">
      <style>{`
        @media (max-width: 768px) {
          .pedidos-wrap { padding: 16px !important; }
          .pedidos-header { flex-wrap: wrap !important; gap: 10px !important; }
          .pedidos-notif { flex-wrap: wrap !important; }
        }
      `}</style>

      {/* ── HEADER ── */}
      <div style={s.header} className="pedidos-header">
        <div>
          <h1 style={s.title}>Pedidos online</h1>
          <p style={s.subtitle}>
            {pedidos.length} pedido{pedidos.length !== 1 ? "s" : ""} en total
            · Actualización automática cada 30 seg
          </p>
        </div>
        {tabActiva === "pedidos" && (
          <button style={s.refetchBtn} onClick={fetchPedidos}>
            🔄 Actualizar
          </button>
        )}
      </div>

      {notifPermiso !== "granted" && (
        <div style={s.notifBanner} className="pedidos-notif">
          <span style={s.notifText}>
            🔔 Activa las notificaciones para recibir alertas cuando llegue un nuevo pedido
          </span>
          <button
            onClick={pedirPermiso}
            style={{ ...s.notifBtn, ...(notifPermiso === "denied" ? s.notifBtnBloq : {}) }}
            disabled={notifPermiso === "denied"}
          >
            {notifPermiso === "denied" ? "Bloqueadas en el navegador" : "Activar notificaciones"}
          </button>
        </div>
      )}

      {/* 3️⃣ TABS */}
      <div style={s.tabs}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            style={{
              ...s.tabBtn,
              ...(tabActiva === tab.key ? s.tabBtnActive : {}),
            }}
            onClick={() => setTabActiva(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── CONTENIDO SEGÚN TAB ── */}
      {tabActiva === "envio" ? (
        <EnvioConfig />
      ) : (
        <>
          {/* ── FILTROS ── */}
          <div style={s.filtros}>
            <button
              style={{ ...s.filtroBtn, ...(filtro === "todos" ? s.filtroBtnActive : {}) }}
              onClick={() => setFiltro("todos")}
            >
              Todos <span style={s.filtroCount}>{pedidos.length}</span>
            </button>
            {ESTADOS.map(e => (
              <button
                key={e.key}
                style={{
                  ...s.filtroBtn,
                  ...(filtro === e.key
                    ? { ...s.filtroBtnActive, borderColor: e.color, color: e.color, backgroundColor: e.bg }
                    : {}),
                }}
                onClick={() => setFiltro(e.key)}
              >
                {e.label}
                {conteos[e.key] > 0 && (
                  <span style={{ ...s.filtroCount, backgroundColor: e.color, color: "white" }}>
                    {conteos[e.key]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── BUSCADOR ── */}
          <div style={s.buscadorWrap}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="9" cy="9" r="6"/><path d="M15 15l3 3"/>
            </svg>
            <input
              style={s.buscador}
              placeholder="Buscar por # pedido o cliente..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
            {busqueda && (
              <button style={s.clearBtn} onClick={() => setBusqueda("")}>✕</button>
            )}
          </div>

          {/* ── LISTA ── */}
          {loading ? (
            <div style={s.skeletonWrap}>
              {[1, 2, 3].map(i => <div key={i} style={s.skeleton} />)}
            </div>
          ) : error ? (
            <div style={s.errorBox}>⚠️ {error}</div>
          ) : pedidosFiltrados.length === 0 ? (
            <div style={s.empty}>
              <span style={{ fontSize: "40px" }}>📦</span>
              <p>No hay pedidos{filtro !== "todos" ? ` con estado "${ESTADOS.find(e => e.key === filtro)?.label}"` : ""}</p>
            </div>
          ) : (
            <div style={s.lista}>
              {pedidosFiltrados.map(pedido => (
                <PedidoCardAdmin
                  key={pedido.id}
                  pedido={pedido}
                  cambiando={cambiando}
                  onCambiarEstado={cambiarEstado}
                />
              ))}
            </div>
          )}
        </>
      )}

    </div>
  );
}

const s = {
  wrap: { padding: "28px", fontFamily: "'Inter', 'Segoe UI', sans-serif", width: "100%" },
  header:        { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" },
  title:         { fontSize: "22px", fontWeight: "800", color: "#0f172a", marginBottom: "4px" },
  subtitle:      { fontSize: "13px", color: "#64748b" },
  refetchBtn:    { padding: "8px 16px", backgroundColor: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: "9px", fontSize: "13px", cursor: "pointer", fontWeight: "500", color: "#374151" },

  // Tabs
  tabs:          { display: "flex", gap: "4px", marginBottom: "24px", borderBottom: "2px solid #e2e8f0", paddingBottom: "0" },
  tabBtn:        { padding: "8px 18px", border: "none", background: "none", fontSize: "13px", fontWeight: "600", color: "#94a3b8", cursor: "pointer", borderBottom: "2px solid transparent", marginBottom: "-2px", borderRadius: "0", transition: "all 0.15s" },
  tabBtnActive:  { color: "#2563eb", borderBottom: "2px solid #2563eb" },

  filtros:       { display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" },
  filtroBtn:     { display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "999px", border: "1.5px solid #e2e8f0", backgroundColor: "white", fontSize: "12px", fontWeight: "600", color: "#64748b", cursor: "pointer", transition: "all 0.15s" },
  filtroBtnActive: { borderColor: "#2563eb", color: "#2563eb", backgroundColor: "#eff6ff" },
  filtroCount:   { backgroundColor: "#e2e8f0", color: "#64748b", fontSize: "10px", fontWeight: "700", padding: "1px 6px", borderRadius: "999px" },
  buscadorWrap:  { display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", backgroundColor: "white", border: "1.5px solid #e2e8f0", borderRadius: "10px", marginBottom: "20px" },
  buscador:      { flex: 1, border: "none", outline: "none", fontSize: "13px", color: "#0f172a", background: "none" },
  clearBtn:      { background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "12px" },
  skeletonWrap:  { display: "flex", flexDirection: "column", gap: "10px" },
  skeleton:      { height: "72px", borderRadius: "14px", backgroundColor: "#e2e8f0" },
  empty:         { textAlign: "center", padding: "60px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", color: "#64748b", fontSize: "14px" },
  errorBox:      { backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "12px 16px", fontSize: "13px", color: "#b91c1c" },
  lista:         { display: "flex", flexDirection: "column", gap: "10px" },
  notifBanner:   { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "10px 16px", backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "10px", marginBottom: "16px" },
  notifText:     { fontSize: "13px", color: "#92400e", flex: 1 },
  notifBtn:      { flexShrink: 0, padding: "6px 14px", backgroundColor: "#f59e0b", color: "white", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: "600", cursor: "pointer" },
  notifBtnBloq:  { backgroundColor: "#e2e8f0", color: "#94a3b8", cursor: "not-allowed" },
};