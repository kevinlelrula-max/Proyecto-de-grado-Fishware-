import { useState } from "react";
import { Pause, Play, Pencil, Trash2, Award, Medal, Star, Sparkles, Crown, CheckCircle } from "lucide-react";

export default function NivelCard({ nivel, onEditar, onEliminar, onToggle }) {
  const [confirmando, setConfirmando] = useState(false);
  const iconos = [Award, Medal, Star, Sparkles, Crown];
  const colores = [
    { bg: "#fef3c7", color: "#92400e", border: "#fde68a" }, // bronce
    { bg: "#f1f5f9", color: "#475569", border: "#cbd5e1" }, // plata
    { bg: "#fffbeb", color: "#b45309", border: "#fcd34d" }, // oro
    { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" }, // diamante
    { bg: "#fdf4ff", color: "#7e22ce", border: "#e9d5ff" }, // platino
  ];

  const nombres = ["bronce", "plata", "oro", "diamante", "platino"];
  const idx = nombres.findIndex(n => nivel.nombre.toLowerCase().includes(n));
  const colorIdx = idx >= 0 ? idx : 0;
  const { bg, color, border } = colores[colorIdx];
  const IconComponent = iconos[colorIdx];

  return (
    <div style={{
      ...s.card,
      borderColor: nivel.activo ? border : "#e2e8f0",
      opacity: nivel.activo ? 1 : 0.6,
    }}>
      {/* Header */}
      <div style={s.header}>
        <div style={{ ...s.iconWrap, backgroundColor: bg, color }}>
          <IconComponent size={22} />
        </div>
        <div style={s.info}>
          <p style={{ ...s.nombre, color }}>{nivel.nombre}</p>
          <p style={{ ...s.estado, color: nivel.activo ? "#15803d" : "#94a3b8", display: "flex", alignItems: "center", gap: "3px" }}>
            {nivel.activo && <CheckCircle size={10} />}
            {nivel.activo ? "Activo" : "Inactivo"}
          </p>
        </div>
        <div style={s.actions}>
          {confirmando ? (
            <>
              <span style={s.confirmText}>¿Eliminar?</span>
              <button style={s.btnConfirmYes} onClick={() => { onEliminar(nivel.id); setConfirmando(false); }}>Sí</button>
              <button style={s.btnConfirmNo} onClick={() => setConfirmando(false)}>No</button>
            </>
          ) : (
            <>
              <button style={s.btnToggle} onClick={() => onToggle(nivel)} title={nivel.activo ? "Desactivar" : "Activar"}>
                {nivel.activo ? <Pause size={13} /> : <Play size={13} />}
              </button>
              <button style={s.btnEditar} onClick={() => onEditar(nivel)}>
                <Pencil size={13} />
              </button>
              <button style={s.btnEliminar} onClick={() => setConfirmando(true)}>
                <Trash2 size={13} />
              </button>
            </>
          )}
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
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748b",
  },
  btnEditar: {
    background: "none",
    border: "1px solid #e2e8f0",
    borderRadius: "7px",
    padding: "5px 8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748b",
  },
  btnEliminar: {
    background: "none",
    border: "1px solid #fecaca",
    borderRadius: "7px",
    padding: "5px 8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#b91c1c",
  },
  confirmText: { fontSize: "11px", color: "#dc2626", fontWeight: "600", whiteSpace: "nowrap" },
  btnConfirmYes: {
    padding: "4px 10px", fontSize: "12px", fontWeight: "700",
    backgroundColor: "#dc2626", color: "white",
    border: "none", borderRadius: "7px", cursor: "pointer",
  },
  btnConfirmNo: {
    padding: "4px 10px", fontSize: "12px", fontWeight: "600",
    backgroundColor: "#f1f5f9", color: "#64748b",
    border: "1px solid #e2e8f0", borderRadius: "7px", cursor: "pointer",
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
