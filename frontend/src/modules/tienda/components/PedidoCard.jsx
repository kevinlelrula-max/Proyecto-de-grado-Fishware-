import { useState, useEffect } from "react";
import { ESTADOS } from "../hooks/useMisPedidos";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

function useHistorial(pedidoId) {
  const [historial, setHistorial] = useState([]);
  const [abierto, setAbierto]     = useState(false);
  const [loading, setLoading]     = useState(false);

  const cargar = async () => {
    if (historial.length > 0) { setAbierto(!abierto); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem("cliente_token");
      const res   = await fetch(`${API_BASE}/api/pedidos/${pedidoId}/historial`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setHistorial(data);
      setAbierto(true);
    } catch { /* silencioso */ }
    finally { setLoading(false); }
  };

  return { historial, abierto, loading, cargar };
}

export default function PedidoCard({ pedido }) {
  const { historial, abierto, loading, cargar } = useHistorial(pedido.id);
  const estado  = ESTADOS[pedido.estado] || ESTADOS.pendiente;
  const fecha   = new Date(pedido.fecha_pedido).toLocaleDateString("es-CO", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div style={s.card}>

      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <span style={s.pedidoId}>Pedido #{pedido.id}</span>
          <span style={s.fecha}>{fecha}</span>
        </div>
        <div style={{ ...s.estadoBadge, backgroundColor: estado.bg, color: estado.color }}>
          <span>{estado.icon}</span>
          <span style={s.estadoLabel}>{estado.label}</span>
        </div>
      </div>

      {/* Empresa */}
      <div style={s.empresa}>
        <span style={s.empresaIcon}>🏪</span>
        <span style={s.empresaNombre}>{pedido.empresa_nombre}</span>
        {pedido.empresa_telefono && (
          <span style={s.empresaTel}>· 📞 {pedido.empresa_telefono}</span>
        )}
      </div>

      {/* Progreso visual del estado */}
      <div style={s.progreso}>
        {["pendiente", "confirmado", "en_preparacion", "enviado", "entregado"].map((e, i) => {
          const estados    = ["pendiente", "confirmado", "en_preparacion", "enviado", "entregado"];
          const indexActual = estados.indexOf(pedido.estado);
          const activo     = i <= indexActual && pedido.estado !== "cancelado";
          const esActual   = e === pedido.estado && pedido.estado !== "cancelado";

          return (
            <div key={e} style={s.progresoStep}>
              <div style={{
                ...s.progresoDot,
                backgroundColor: activo ? ESTADOS[e]?.color ?? "#0F6E56" : "#e2e8f0",
                transform: esActual ? "scale(1.3)" : "scale(1)",
                boxShadow: esActual ? `0 0 0 3px ${ESTADOS[e]?.bg}` : "none",
              }} />
              {i < 4 && (
                <div style={{
                  ...s.progresoLinea,
                  backgroundColor: i < indexActual && pedido.estado !== "cancelado"
                    ? "#0F6E56" : "#e2e8f0",
                }} />
              )}
            </div>
          );
        })}
      </div>
      <div style={s.progresoLabels}>
        {["Pendiente", "Confirmado", "Preparando", "Enviado", "Entregado"].map((l) => (
          <span key={l} style={s.progresoLabel}>{l}</span>
        ))}
      </div>

      {/* Detalle de productos */}
      <div style={s.detalle}>
        <p style={s.detalleTitle}>Productos</p>
        {pedido.detalle?.map((item, i) => (
          <div key={i} style={s.detalleItem}>
            <span style={s.detalleNombre}>🐟 {item.nombre}</span>
            <span style={s.detalleKilos}>{item.kilos} kg</span>
            <span style={s.detalleSubtotal}>
              ${Number(item.subtotal).toLocaleString("es-CO")}
            </span>
          </div>
        ))}
      </div>

      {/* Botón historial */}
      <div style={s.historialBtn} onClick={cargar}>
        {loading ? "Cargando historial..." : abierto ? "▲ Ocultar historial" : "▼ Ver historial de estados"}
      </div>

      {/* Timeline historial */}
      {abierto && historial.length > 0 && (
        <div style={s.historialWrap}>
          {historial.map((h, i) => {
            const est = ESTADOS[h.estado] || ESTADOS.pendiente;
            return (
              <div key={i} style={s.historialItem}>
                <div style={{ ...s.historialDot, backgroundColor: est.color }} />
                {i < historial.length - 1 && <div style={s.historialLinea} />}
                <div style={s.historialInfo}>
                  <span style={{ ...s.historialEstado, color: est.color }}>
                    {est.icon} {est.label}
                  </span>
                  <span style={s.historialFecha}>
                    {new Date(h.cambiado_en).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" })}
                  </span>
                  {h.nota && <span style={s.historialNota}>📝 {h.nota}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div style={s.footer}>
        <div style={s.footerLeft}>
          {pedido.direccion_entrega && (
            <p style={s.direccion}>📍 {pedido.direccion_entrega}</p>
          )}
          {pedido.metodo_pago && (
            <p style={s.metodoPago}>💳 {pedido.metodo_pago}</p>
          )}
          {pedido.notas && (
            <p style={s.notas}>📝 {pedido.notas}</p>
          )}
        </div>
        <div style={s.total}>
          <span style={s.totalLabel}>Total</span>
          <span style={s.totalValor}>${Number(pedido.total).toLocaleString("es-CO")}</span>
        </div>
      </div>

    </div>
  );
}

const s = {
  card: {
    backgroundColor: "white",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    padding: "18px 20px 14px",
    borderBottom: "1px solid #f1f5f9",
  },
  headerLeft: { display: "flex", flexDirection: "column", gap: "4px" },
  pedidoId: { fontSize: "15px", fontWeight: "700", color: "#0f172a" },
  fecha: { fontSize: "12px", color: "#94a3b8" },
  estadoBadge: {
    display: "flex", alignItems: "center", gap: "5px",
    padding: "5px 12px", borderRadius: "999px",
    fontSize: "12px", fontWeight: "600",
  },
  estadoLabel: { whiteSpace: "nowrap" },

  empresa: {
    display: "flex", alignItems: "center", gap: "6px",
    padding: "10px 20px",
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #f1f5f9",
  },
  empresaIcon: { fontSize: "14px" },
  empresaNombre: { fontSize: "13px", fontWeight: "600", color: "#0f172a" },
  empresaTel: { fontSize: "12px", color: "#64748b" },

  // Progreso
  progreso: {
    display: "flex", alignItems: "center",
    padding: "16px 20px 4px",
  },
  progresoStep: { display: "flex", alignItems: "center", flex: 1 },
  progresoDot: {
    width: "10px", height: "10px", borderRadius: "50%",
    flexShrink: 0, transition: "all 0.3s ease",
  },
  progresoLinea: {
    flex: 1, height: "2px",
    transition: "background 0.3s ease",
  },
  progresoLabels: {
    display: "flex", justifyContent: "space-between",
    padding: "0 20px 14px",
  },
  progresoLabel: {
    fontSize: "10px", color: "#94a3b8",
    textAlign: "center", flex: 1,
  },

  // Detalle
  detalle: {
    padding: "14px 20px",
    borderTop: "1px solid #f1f5f9",
    borderBottom: "1px solid #f1f5f9",
  },
  detalleTitle: {
    fontSize: "11px", fontWeight: "700",
    color: "#94a3b8", textTransform: "uppercase",
    letterSpacing: "0.06em", marginBottom: "8px",
  },
  detalleItem: {
    display: "flex", alignItems: "center",
    gap: "8px", padding: "5px 0",
    borderBottom: "1px solid #f8fafc",
  },
  detalleNombre: { flex: 1, fontSize: "13px", color: "#374151" },
  detalleKilos: { fontSize: "12px", color: "#64748b", minWidth: "50px", textAlign: "right" },
  detalleSubtotal: { fontSize: "13px", fontWeight: "600", color: "#0F6E56", minWidth: "80px", textAlign: "right" },

  // Footer
  footer: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-end",
    padding: "14px 20px",
  },
  footerLeft: { display: "flex", flexDirection: "column", gap: "4px" },
  direccion: { fontSize: "12px", color: "#64748b", margin: 0 },
  metodoPago: { fontSize: "12px", color: "#64748b", margin: 0 },
  notas: { fontSize: "12px", color: "#94a3b8", fontStyle: "italic", margin: 0 },
  total: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" },
  totalLabel: { fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase" },
  totalValor: { fontSize: "20px", fontWeight: "800", color: "#0F6E56" },

  // Historial
  historialBtn: {
    padding: "10px 20px", textAlign: "center",
    fontSize: "12px", fontWeight: "600", color: "#64748b",
    cursor: "pointer", borderTop: "1px solid #f1f5f9",
    backgroundColor: "#fafafa",
    userSelect: "none",
  },
  historialWrap: {
    padding: "12px 20px 16px",
    backgroundColor: "#f8fafc",
    borderTop: "1px solid #f1f5f9",
    display: "flex",
    flexDirection: "column",
    gap: "0",
  },
  historialItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    position: "relative",
  },
  historialDot: {
    width: "10px", height: "10px", borderRadius: "50%",
    flexShrink: 0, marginTop: "4px",
  },
  historialLinea: {
    position: "absolute", left: "4px", top: "14px",
    width: "2px", height: "28px",
    backgroundColor: "#e2e8f0",
  },
  historialInfo: {
    display: "flex", flexDirection: "column", gap: "1px",
    paddingBottom: "16px",
  },
  historialEstado: { fontSize: "13px", fontWeight: "600" },
  historialFecha:  { fontSize: "11px", color: "#94a3b8" },
  historialNota:   { fontSize: "11px", color: "#64748b", fontStyle: "italic" },
};