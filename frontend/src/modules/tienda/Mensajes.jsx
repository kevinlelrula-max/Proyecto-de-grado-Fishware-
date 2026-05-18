import { useState, useEffect, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

function getToken() {
  return localStorage.getItem("token");
}

export default function Mensajes() {
  const [mensajes, setMensajes]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [seleccionado, setSeleccionado] = useState(null);
  const [filtro, setFiltro]           = useState("todos"); // todos | no_leidos

  const fetchMensajes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/contacto`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMensajes(data);
    } catch {
      setMensajes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMensajes(); }, [fetchMensajes]);

  const marcarLeido = async (id) => {
    try {
      await fetch(`${API_BASE}/api/contacto/${id}/leido`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setMensajes(prev => prev.map(m => m.id === id ? { ...m, leido: true } : m));
    } catch {}
  };

  const handleSeleccionar = (mensaje) => {
    setSeleccionado(mensaje);
    if (!mensaje.leido) marcarLeido(mensaje.id);
  };

  const mensajesFiltrados = filtro === "no_leidos"
    ? mensajes.filter(m => !m.leido)
    : mensajes;

  const noLeidos = mensajes.filter(m => !m.leido).length;

  return (
    <div style={s.page}>

      {/* Header */}
      <div style={s.header}>
        <div>
          <h2 style={s.title}>Mensajes de contacto</h2>
          <p style={s.subtitle}>Mensajes recibidos desde tu tienda online</p>
        </div>
        <button style={s.btnRefresh} onClick={fetchMensajes}>
          🔄 Actualizar
        </button>
      </div>

      {/* Filtros */}
      <div style={s.filtros}>
        <button
          style={{ ...s.filtroBtn, backgroundColor: filtro === "todos" ? "#0B1628" : "white", color: filtro === "todos" ? "white" : "#64748b" }}
          onClick={() => setFiltro("todos")}
        >
          Todos ({mensajes.length})
        </button>
        <button
          style={{ ...s.filtroBtn, backgroundColor: filtro === "no_leidos" ? "#0B1628" : "white", color: filtro === "no_leidos" ? "white" : "#64748b" }}
          onClick={() => setFiltro("no_leidos")}
        >
          No leídos {noLeidos > 0 && <span style={s.badge}>{noLeidos}</span>}
        </button>
      </div>

      {loading ? (
        <div style={s.loading}>
          <p style={s.loadingText}>Cargando mensajes...</p>
        </div>
      ) : mensajesFiltrados.length === 0 ? (
        <div style={s.empty}>
          <span style={s.emptyIcon}>💬</span>
          <p style={s.emptyTitle}>
            {filtro === "no_leidos" ? "No tienes mensajes sin leer" : "Aún no tienes mensajes"}
          </p>
          <p style={s.emptyDesc}>Los mensajes de tu tienda aparecerán aquí</p>
        </div>
      ) : (
        <div style={s.grid}>

          {/* Lista */}
          <div style={s.lista}>
            {mensajesFiltrados.map((m) => (
              <div
                key={m.id}
                style={{
                  ...s.item,
                  backgroundColor: seleccionado?.id === m.id ? "#f0f9ff" : "white",
                  borderColor: seleccionado?.id === m.id ? "#0099FF" : "#e2e8f0",
                  borderLeft: !m.leido ? "4px solid #0F6E56" : "4px solid transparent",
                }}
                onClick={() => handleSeleccionar(m)}
              >
                <div style={s.itemTop}>
                  <div style={s.itemAvatar}>
                    {m.nombre?.charAt(0).toUpperCase()}
                  </div>
                  <div style={s.itemInfo}>
                    <p style={{ ...s.itemNombre, fontWeight: m.leido ? "500" : "700" }}>
                      {m.nombre}
                    </p>
                    <p style={s.itemPreview}>
                      {m.mensaje.length > 60 ? `${m.mensaje.slice(0, 60)}...` : m.mensaje}
                    </p>
                  </div>
                  <div style={s.itemRight}>
                    <p style={s.itemFecha}>
                      {new Date(m.fecha).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}
                    </p>
                    {!m.leido && <div style={s.dotNoLeido} />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Detalle */}
          <div style={s.detalle}>
            {seleccionado ? (
              <div style={s.detalleCard}>
                <div style={s.detalleHeader}>
                  <div style={s.detalleAvatar}>
                    {seleccionado.nombre?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={s.detalleNombre}>{seleccionado.nombre}</p>
                    <p style={s.detalleFecha}>
                      {new Date(seleccionado.fecha).toLocaleDateString("es-CO", {
                        weekday: "long", year: "numeric",
                        month: "long", day: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                <div style={s.detalleContacto}>
                  {seleccionado.email && (
                    <a href={`mailto:${seleccionado.email}`} style={s.detalleContactoItem}>
                      ✉️ {seleccionado.email}
                    </a>
                  )}
                  {seleccionado.telefono && (
                    <a href={`tel:${seleccionado.telefono}`} style={s.detalleContactoItem}>
                      📞 {seleccionado.telefono}
                    </a>
                  )}
                  {seleccionado.telefono && (
                    <a
                      href={`https://wa.me/${seleccionado.telefono.replace(/\D/g, "")}`}
                      target="_blank" rel="noreferrer"
                      style={{ ...s.detalleContactoItem, color: "#25D366" }}
                    >
                      📱 Responder por WhatsApp
                    </a>
                  )}
                </div>

                <div style={s.detalleMensaje}>
                  <p style={s.detalleMensajeLabel}>Mensaje</p>
                  <p style={s.detalleMensajeTexto}>{seleccionado.mensaje}</p>
                </div>

                {seleccionado.email && (
                  <a
                    href={`mailto:${seleccionado.email}?subject=Re: Tu mensaje a nuestra tienda`}
                    style={s.btnResponder}
                  >
                    ✉️ Responder por email
                  </a>
                )}
              </div>
            ) : (
              <div style={s.detalleVacio}>
                <span style={{ fontSize: "40px" }}>💬</span>
                <p style={s.detalleVacioText}>Selecciona un mensaje para verlo</p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

const s = {
  page: {
    padding: "28px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    display: "flex", flexDirection: "column", gap: "20px",
  },
  header: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between", gap: "16px",
  },
  title: { fontSize: "22px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.02em", marginBottom: "4px" },
  subtitle: { fontSize: "13px", color: "#94a3b8" },
  btnRefresh: {
    padding: "8px 16px", backgroundColor: "white",
    border: "1px solid #e2e8f0", borderRadius: "9px",
    fontSize: "13px", fontWeight: "600", cursor: "pointer",
    color: "#64748b",
  },
  filtros: { display: "flex", gap: "8px" },
  filtroBtn: {
    padding: "7px 16px", border: "1px solid #e2e8f0",
    borderRadius: "9px", fontSize: "13px", fontWeight: "500",
    cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
  },
  badge: {
    backgroundColor: "#ef4444", color: "white",
    borderRadius: "999px", fontSize: "11px",
    fontWeight: "700", padding: "1px 6px",
  },
  loading: { display: "flex", justifyContent: "center", padding: "40px" },
  loadingText: { fontSize: "14px", color: "#94a3b8" },
  empty: {
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: "10px",
    padding: "60px", textAlign: "center",
  },
  emptyIcon: { fontSize: "48px" },
  emptyTitle: { fontSize: "16px", fontWeight: "600", color: "#64748b" },
  emptyDesc: { fontSize: "13px", color: "#94a3b8" },
  grid: {
    display: "grid", gridTemplateColumns: "1fr 1.4fr",
    gap: "20px", alignItems: "start",
  },
  lista: {
    display: "flex", flexDirection: "column", gap: "8px",
    maxHeight: "600px", overflowY: "auto",
  },
  item: {
    borderRadius: "12px", border: "1px solid",
    padding: "14px 16px", cursor: "pointer",
    transition: "all 0.15s",
  },
  itemTop: { display: "flex", alignItems: "flex-start", gap: "12px" },
  itemAvatar: {
    width: "38px", height: "38px", borderRadius: "10px",
    backgroundColor: "#E1F5EE", color: "#0F6E56",
    fontSize: "15px", fontWeight: "700",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  itemInfo: { flex: 1, minWidth: 0 },
  itemNombre: { fontSize: "14px", color: "#0f172a", marginBottom: "3px" },
  itemPreview: { fontSize: "12px", color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  itemRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", flexShrink: 0 },
  itemFecha: { fontSize: "11px", color: "#94a3b8" },
  dotNoLeido: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#0F6E56" },
  detalle: {},
  detalleCard: {
    backgroundColor: "white", borderRadius: "16px",
    border: "1px solid #e2e8f0", padding: "24px",
    display: "flex", flexDirection: "column", gap: "20px",
  },
  detalleHeader: { display: "flex", alignItems: "center", gap: "14px" },
  detalleAvatar: {
    width: "52px", height: "52px", borderRadius: "14px",
    background: "linear-gradient(135deg, #00C9A7, #0099FF)",
    color: "white", fontSize: "20px", fontWeight: "700",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  detalleNombre: { fontSize: "18px", fontWeight: "700", color: "#0f172a", marginBottom: "4px" },
  detalleFecha: { fontSize: "12px", color: "#94a3b8" },
  detalleContacto: {
    display: "flex", flexDirection: "column", gap: "8px",
    padding: "14px 16px",
    backgroundColor: "#f8fafc",
    borderRadius: "10px", border: "1px solid #e2e8f0",
  },
  detalleContactoItem: {
    fontSize: "14px", color: "#0f172a",
    textDecoration: "none", fontWeight: "500",
  },
  detalleMensaje: {
    padding: "16px",
    backgroundColor: "#f8fafc",
    borderRadius: "10px", border: "1px solid #e2e8f0",
  },
  detalleMensajeLabel: { fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" },
  detalleMensajeTexto: { fontSize: "15px", color: "#0f172a", lineHeight: "1.7" },
  btnResponder: {
    display: "inline-flex", alignItems: "center", gap: "8px",
    padding: "11px 20px",
    backgroundColor: "#0B1628", color: "white",
    borderRadius: "10px", fontSize: "14px",
    fontWeight: "600", textDecoration: "none",
    alignSelf: "flex-start",
  },
  detalleVacio: {
    backgroundColor: "white", borderRadius: "16px",
    border: "1px solid #e2e8f0", padding: "60px",
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: "12px",
    textAlign: "center",
  },
  detalleVacioText: { fontSize: "14px", color: "#94a3b8" },
};