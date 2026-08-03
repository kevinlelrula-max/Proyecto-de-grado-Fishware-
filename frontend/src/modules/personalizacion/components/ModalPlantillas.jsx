import { useState } from "react";
import { PLANTILLAS } from "../data/plantillas";

const TIPOS_LABELS = {
  hero: "Portada",
  catalogo: "Catálogo",
  nosotros: "Sobre nosotros",
  contacto: "Contacto",
  faq: "Preguntas frecuentes",
  galeria: "Galería",
  testimonios: "Testimonios",
  promociones: "Promociones",
};

export default function ModalPlantillas({ onCerrar, onAplicar }) {
  const [confirmando, setConfirmando] = useState(null);

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

        <div style={s.header}>
          <div>
            <div style={s.titulo}>Plantillas</div>
            <div style={s.subtitulo}>Elige un diseño base y personalízalo desde el editor</div>
          </div>
          <button style={s.cerrarBtn} onClick={onCerrar}>✕</button>
        </div>

        {confirmando && (
          <div style={s.aviso}>
            <span style={{ fontSize: 14 }}>⚠️</span>
            <span>
              Esto reemplazará los colores, tipografía y secciones actuales.{" "}
              <strong style={{ color: "#fbbf24" }}>¿Confirmas aplicar {confirmando.nombre}?</strong>
            </span>
            <div style={{ display: "flex", gap: 8, marginLeft: "auto", flexShrink: 0 }}>
              <button style={s.cancelarBtn} onClick={() => setConfirmando(null)}>Cancelar</button>
              <button style={s.confirmarBtn} onClick={() => handleAplicar(confirmando)}>Sí, aplicar</button>
            </div>
          </div>
        )}

        <div style={s.grid}>
          {PLANTILLAS.map(plantilla => {
            const esConfirmando = confirmando?.id === plantilla.id;
            return (
              <div key={plantilla.id} style={{ ...s.card, borderColor: esConfirmando ? "#fbbf24" : "rgba(255,255,255,0.08)" }}>

                {/* Previsualización de colores */}
                <div style={{ ...s.preview, backgroundColor: plantilla.color_secundario }}>
                  <div style={s.previewNav}>
                    <div style={{ ...s.previewDot, backgroundColor: plantilla.color_primario }} />
                    <div style={s.previewLineas}>
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{ ...s.previewLinea, opacity: 0.4 }} />
                      ))}
                    </div>
                  </div>
                  <div style={s.previewHero}>
                    <div style={{ ...s.previewBarra, backgroundColor: "white", width: 70 }} />
                    <div style={{ ...s.previewBarra, backgroundColor: "white", width: 45, opacity: 0.5 }} />
                    <div style={{ ...s.previewBtn, backgroundColor: plantilla.color_primario }} />
                  </div>
                  <div style={s.previewSecciones}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{ ...s.previewSeccion, backgroundColor: i % 2 === 0 ? plantilla.color_primario : plantilla.color_secundario }} />
                    ))}
                  </div>
                </div>

                {/* Info */}
                <div style={s.info}>
                  <div style={s.nombre}>{plantilla.nombre}</div>
                  {plantilla.descripcion && <div style={s.desc}>{plantilla.descripcion}</div>}
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={s.varianteBadge}>{plantilla.secciones.find(sec => sec.tipo === "hero")?.config?.variante || "oscuro"}</span>
                    <span style={s.fuente}>{plantilla.fuente}</span>
                  </div>
                  <div style={s.coloresFila}>
                    <div style={{ ...s.colorChip, backgroundColor: plantilla.color_primario }} title={plantilla.color_primario} />
                    <div style={{ ...s.colorChip, backgroundColor: plantilla.color_secundario }} title={plantilla.color_secundario} />
                  </div>
                  <div style={s.secciones}>
                    {plantilla.secciones.map(sec => (
                      <span key={sec.tipo} style={s.seccionTag}>{TIPOS_LABELS[sec.tipo] || sec.tipo}</span>
                    ))}
                  </div>
                  <button
                    style={{ ...s.aplicarBtn, background: esConfirmando ? "#fbbf24" : "rgba(0,201,167,0.15)", color: esConfirmando ? "#0B1628" : "#00C9A7", border: `1px solid ${esConfirmando ? "#fbbf24" : "rgba(0,201,167,0.3)"}` }}
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
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backdropFilter: "blur(4px)",
  },
  modal: {
    backgroundColor: "#0d1e35",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.1)",
    width: "100%",
    maxWidth: 820,
    maxHeight: "85vh",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: "20px 20px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    flexShrink: 0,
  },
  titulo: { fontSize: 16, fontWeight: 700, color: "#e2e8f0" },
  subtitulo: { fontSize: 12, color: "#4A6080", marginTop: 3 },
  cerrarBtn: { background: "none", border: "none", color: "#4A6080", fontSize: 18, cursor: "pointer", lineHeight: 1, padding: "2px 4px", flexShrink: 0 },
  aviso: {
    margin: "12px 20px 0",
    padding: "10px 14px",
    backgroundColor: "rgba(251,191,36,0.08)",
    border: "1px solid rgba(251,191,36,0.25)",
    borderRadius: 10,
    fontSize: 12,
    color: "#cbd5e1",
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    lineHeight: 1.5,
  },
  cancelarBtn: { padding: "5px 12px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, color: "#94a3b8", fontSize: 12, cursor: "pointer" },
  confirmarBtn: { padding: "5px 12px", background: "#fbbf24", border: "none", borderRadius: 7, color: "#0B1628", fontSize: 12, fontWeight: 700, cursor: "pointer" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: 14,
    padding: 20,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.03)",
    border: "1px solid",
    borderRadius: 12,
    overflow: "hidden",
    transition: "border-color 0.15s",
  },
  preview: { height: 110, display: "flex", flexDirection: "column", overflow: "hidden" },
  previewNav: { height: 16, display: "flex", alignItems: "center", padding: "0 8px", gap: 5, flexShrink: 0 },
  previewDot: { width: 14, height: 14, borderRadius: 3, flexShrink: 0 },
  previewLineas: { display: "flex", gap: 4, marginLeft: 4 },
  previewLinea: { height: 4, width: 18, borderRadius: 2, backgroundColor: "white" },
  previewHero: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, padding: 6 },
  previewBarra: { height: 5, borderRadius: 3 },
  previewBtn: { height: 9, width: 32, borderRadius: 4, marginTop: 2 },
  previewSecciones: { display: "flex", gap: 4, padding: "0 8px 6px" },
  previewSeccion: { flex: 1, height: 14, borderRadius: 3, opacity: 0.3 },
  info: { padding: "10px 12px 12px", display: "flex", flexDirection: "column", gap: 6 },
  nombre: { fontSize: 13, fontWeight: 700, color: "#e2e8f0" },
  desc:   { fontSize: 11, color: "#64748b", lineHeight: 1.4 },
  varianteBadge: { fontSize: 10, padding: "2px 7px", borderRadius: 6, backgroundColor: "rgba(0,201,167,0.1)", color: "#00C9A7", border: "1px solid rgba(0,201,167,0.2)", fontWeight: 600 },
  fuente: { fontSize: 11, color: "#4A6080" },
  coloresFila: { display: "flex", gap: 6 },
  colorChip: { width: 18, height: 18, borderRadius: 4, border: "1px solid rgba(255,255,255,0.1)" },
  secciones: { display: "flex", flexWrap: "wrap", gap: 4 },
  seccionTag: { fontSize: 10, padding: "2px 7px", borderRadius: 8, backgroundColor: "rgba(255,255,255,0.06)", color: "#4A6080" },
  aplicarBtn: { marginTop: 4, padding: "7px 0", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", textAlign: "center", transition: "all 0.15s" },
};
