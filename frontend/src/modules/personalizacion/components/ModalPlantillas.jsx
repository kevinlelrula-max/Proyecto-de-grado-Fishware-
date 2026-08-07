import { useState } from "react";
import { X, AlertTriangle, CheckCircle, Layout } from "lucide-react";
import { PLANTILLAS } from "../data/plantillas";

const TIPOS_LABELS = {
  hero:        "Portada",
  catalogo:    "Catálogo",
  nosotros:    "Sobre nosotros",
  contacto:    "Contacto",
  faq:         "Preguntas frecuentes",
  galeria:     "Galería",
  testimonios: "Testimonios",
  promociones: "Promociones",
};

function MiniPreview({ plantilla }) {
  const { color_primario: cp, color_secundario: cs } = plantilla;
  return (
    <div style={{ height: 120, backgroundColor: cs, display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: "10px 10px 0 0" }}>
      {/* Nav */}
      <div style={{ height: 18, display: "flex", alignItems: "center", padding: "0 10px", gap: 6, backgroundColor: "rgba(0,0,0,0.15)", flexShrink: 0 }}>
        <div style={{ width: 16, height: 8, borderRadius: 3, backgroundColor: cp }} />
        <div style={{ display: "flex", gap: 4, marginLeft: 4 }}>
          {[40, 28, 34].map((w, i) => (
            <div key={i} style={{ height: 3, width: w, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.35)" }} />
          ))}
        </div>
      </div>
      {/* Hero */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, padding: 8 }}>
        <div style={{ height: 5, width: 80, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.9)" }} />
        <div style={{ height: 3, width: 55, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.45)" }} />
        <div style={{ height: 10, width: 38, borderRadius: 5, backgroundColor: cp, marginTop: 3 }} />
      </div>
      {/* Bottom */}
      <div style={{ display: "flex", gap: 4, padding: "0 10px 8px" }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ flex: 1, height: 12, borderRadius: 3, backgroundColor: i % 2 === 0 ? "rgba(255,255,255,0.12)" : cp, opacity: 0.6 }} />
        ))}
      </div>
    </div>
  );
}

export default function ModalPlantillas({ onCerrar, onAplicar }) {
  const [confirmando, setConfirmando] = useState(null);
  const [hovering, setHovering] = useState(null);

  const handleAplicar = (plantilla) => {
    if (confirmando?.id === plantilla.id) {
      onAplicar(plantilla);
      onCerrar();
    } else {
      setConfirmando(plantilla);
    }
  };

  return (
    <div style={s.overlay} onClick={onCerrar}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={s.header}>
          <div style={s.headerLeft}>
            <div style={s.headerIcon}>
              <Layout size={16} color="#2563eb" />
            </div>
            <div>
              <h2 style={s.titulo}>Elige una plantilla</h2>
              <p style={s.subtitulo}>Selecciona un diseño base y personalízalo desde el editor</p>
            </div>
          </div>
          <button style={s.cerrarBtn} onClick={onCerrar}>
            <X size={16} color="#64748b" />
          </button>
        </div>

        {/* Banner de confirmación */}
        {confirmando && (
          <div style={s.aviso}>
            <AlertTriangle size={15} color="#b45309" style={{ flexShrink: 0 }} />
            <span style={s.avisoTexto}>
              Esto reemplazará los colores, tipografía y secciones actuales.{" "}
              <strong style={{ color: "#92400e" }}>¿Confirmas aplicar "{confirmando.nombre}"?</strong>
            </span>
            <div style={{ display: "flex", gap: 8, marginLeft: "auto", flexShrink: 0 }}>
              <button style={s.cancelarBtn} onClick={() => setConfirmando(null)}>Cancelar</button>
              <button style={s.confirmarBtn} onClick={() => handleAplicar(confirmando)}>
                <CheckCircle size={12} style={{ marginRight: 4 }} />
                Sí, aplicar
              </button>
            </div>
          </div>
        )}

        {/* Grid de plantillas */}
        <div style={s.grid}>
          {PLANTILLAS.map(plantilla => {
            const esConfirmando = confirmando?.id === plantilla.id;
            const esHover = hovering === plantilla.id;
            return (
              <div
                key={plantilla.id}
                style={{
                  ...s.card,
                  borderColor: esConfirmando ? "#f59e0b" : esHover ? "#2563eb" : "#e2e8f0",
                  boxShadow: esHover ? "0 4px 16px rgba(37,99,235,0.12)" : esConfirmando ? "0 4px 16px rgba(245,158,11,0.15)" : "none",
                }}
                onMouseEnter={() => setHovering(plantilla.id)}
                onMouseLeave={() => setHovering(null)}
              >
                {/* Preview */}
                <MiniPreview plantilla={plantilla} />

                {/* Info */}
                <div style={s.info}>
                  <div style={s.nombre}>{plantilla.nombre}</div>
                  {plantilla.descripcion && <div style={s.desc}>{plantilla.descripcion}</div>}

                  {/* Badges */}
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
                    <span style={s.varianteBadge}>
                      {plantilla.secciones.find(sec => sec.tipo === "hero")?.config?.variante || "oscuro"}
                    </span>
                    <span style={s.fuente}>{plantilla.fuente}</span>
                  </div>

                  {/* Colores */}
                  <div style={s.coloresFila}>
                    <div style={{ ...s.colorChip, backgroundColor: plantilla.color_primario }} title={plantilla.color_primario} />
                    <div style={{ ...s.colorChip, backgroundColor: plantilla.color_secundario }} title={plantilla.color_secundario} />
                  </div>

                  {/* Secciones incluidas */}
                  <div style={s.secciones}>
                    {plantilla.secciones.map(sec => (
                      <span key={sec.tipo} style={s.seccionTag}>
                        {TIPOS_LABELS[sec.tipo] || sec.tipo}
                      </span>
                    ))}
                  </div>

                  {/* Botón */}
                  <button
                    style={{
                      ...s.aplicarBtn,
                      backgroundColor: esConfirmando ? "#f59e0b" : "#2563eb",
                      color: "white",
                    }}
                    onClick={() => handleAplicar(plantilla)}
                  >
                    {esConfirmando ? "¿Confirmar?" : "Aplicar"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const s = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 10000,
    backgroundColor: "rgba(15,23,42,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backdropFilter: "blur(6px)",
  },
  modal: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    border: "1px solid #e2e8f0",
    boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
    width: "100%",
    maxWidth: 860,
    maxHeight: "88vh",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 24px 18px",
    borderBottom: "1px solid #f1f5f9",
    flexShrink: 0,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 12 },
  headerIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "#eff6ff",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  titulo:   { fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 },
  subtitulo:{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0" },
  cerrarBtn:{
    width: 32, height: 32, borderRadius: 8,
    background: "#f8fafc", border: "1px solid #e2e8f0",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", flexShrink: 0,
  },

  aviso: {
    margin: "14px 24px 0",
    padding: "12px 16px",
    backgroundColor: "#fffbeb",
    border: "1px solid #fde68a",
    borderRadius: 12,
    fontSize: 12,
    color: "#78350f",
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    lineHeight: 1.5,
  },
  avisoTexto: { flex: 1, color: "#92400e", fontSize: 12 },
  cancelarBtn: {
    padding: "6px 14px",
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    color: "#64748b",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  confirmarBtn: {
    padding: "6px 14px",
    background: "#f59e0b",
    border: "none",
    borderRadius: 8,
    color: "white",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: 16,
    padding: 24,
  },
  card: {
    backgroundColor: "#ffffff",
    border: "1.5px solid",
    borderRadius: 12,
    overflow: "hidden",
    transition: "border-color 0.15s, box-shadow 0.15s",
    cursor: "default",
  },
  info: { padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: 7 },
  nombre: { fontSize: 13, fontWeight: 700, color: "#0f172a" },
  desc:   { fontSize: 11, color: "#94a3b8", lineHeight: 1.4 },

  varianteBadge: {
    fontSize: 10, padding: "2px 8px", borderRadius: 6,
    backgroundColor: "#eff6ff", color: "#2563eb",
    border: "1px solid #bfdbfe", fontWeight: 600,
  },
  fuente: { fontSize: 11, color: "#94a3b8", fontStyle: "italic" },

  coloresFila: { display: "flex", gap: 6 },
  colorChip: {
    width: 18, height: 18, borderRadius: 5,
    border: "1.5px solid rgba(0,0,0,0.08)",
  },

  secciones: { display: "flex", flexWrap: "wrap", gap: 4 },
  seccionTag: {
    fontSize: 10, padding: "2px 7px", borderRadius: 8,
    backgroundColor: "#f1f5f9", color: "#64748b",
    fontWeight: 500,
  },

  aplicarBtn: {
    marginTop: 2, padding: "8px 0",
    borderRadius: 9, fontSize: 12, fontWeight: 700,
    cursor: "pointer", textAlign: "center",
    border: "none", transition: "opacity 0.15s",
    width: "100%",
  },
};
