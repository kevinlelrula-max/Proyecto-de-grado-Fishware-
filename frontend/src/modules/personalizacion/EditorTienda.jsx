import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useEditor } from "./hooks/useEditor";
import PanelEditor from "./components/PanelEditor";
import PreviewStore from "./components/PreviewStore";

// ── Botón de entrada al editor (lo que se ve dentro del dashboard) ──────────
export default function EditorTienda() {
  const [editorAbierto, setEditorAbierto] = useState(false);

  return (
    <>
      {/* Vista dentro del dashboard — botón de entrada */}
      {!editorAbierto && (
        <div style={s.entryWrap}>
          <div style={s.entryCard}>
            <div style={s.entryIcon}>🎨</div>
            <h2 style={s.entryTitle}>Editor de tienda</h2>
            <p style={s.entrySub}>
              Personaliza el aspecto de tu tienda online — banner, colores, secciones y más.
            </p>
            <button style={s.entryBtn} onClick={() => setEditorAbierto(true)}>
              Abrir editor →
            </button>
          </div>
        </div>
      )}

      {/* Editor en pantalla completa — montado como portal sobre todo */}
      {editorAbierto && createPortal(
        <EditorFullscreen onCerrar={() => setEditorAbierto(false)} />,
        document.body
      )}
    </>
  );
}

// ── Editor en pantalla completa ──────────────────────────────────────────────
function EditorFullscreen({ onCerrar }) {
  const {
    datos, bannerPreview,
    cargando, guardando, exito, error,
    layout, onLayoutChange, onToggleSeccion,
    onDeleteSeccion, onAddSeccion, onSeccionConfigChange,
    aplicarPlantilla,
    cargar, onChange, onBannerChange, guardar,
  } = useEditor();

  const [seccionActiva, setSeccionActiva] = useState("hero");
  const [vista, setVista]               = useState("desktop");
  const [iframeKey, setIframeKey]       = useState(0);
  const [panelAbierto, setPanelAbierto] = useState(true);

  useEffect(() => { cargar(); }, [cargar]);

  // Bloquear scroll del body mientras el editor está abierto
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleGuardar = useCallback(async () => {
    await guardar();
    setIframeKey(k => k + 1);
  }, [guardar]);

  const slug = datos.slug || localStorage.getItem("empresa_slug") || "";

  return (
    <div style={fs.overlay}>

      {/* ── TOPBAR del editor ── */}
      <div style={fs.topbar}>

        {/* Izquierda: volver */}
        <button style={fs.backBtn} onClick={onCerrar}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Volver al dashboard
        </button>

        {/* Centro: título + URL */}
        <div style={fs.topCenter}>
          <span style={fs.topTitle}>✏️ Editor de tienda</span>
          {slug && (
            <span style={fs.topSlug}>
              /tienda/{slug}
            </span>
          )}
        </div>

        {/* Derecha: toggle panel + toggle vista + publicar */}
        <div style={fs.topRight}>
          <button
            style={{ ...fs.topBtn, backgroundColor: panelAbierto ? "rgba(0,201,167,0.1)" : "rgba(255,255,255,0.05)" }}
            onClick={() => setPanelAbierto(v => !v)}
            title={panelAbierto ? "Ocultar panel" : "Mostrar panel"}
          >
            {panelAbierto ? "◀ Panel" : "▶ Panel"}
          </button>

          {/* Toggle desktop/mobile */}
          <div style={fs.vistasToggle}>
            {[
              { key: "desktop", icon: "🖥️", label: "Escritorio" },
              { key: "mobile",  icon: "📱", label: "Móvil" },
            ].map(v => (
              <button
                key={v.key}
                onClick={() => setVista(v.key)}
                title={v.label}
                style={{
                  ...fs.vistaBtn,
                  backgroundColor: vista === v.key ? "rgba(255,255,255,0.15)" : "transparent",
                  color: vista === v.key ? "white" : "#64748b",
                }}
              >
                {v.icon}
              </button>
            ))}
          </div>

          <button
            onClick={handleGuardar}
            disabled={guardando}
            style={{
              ...fs.publishBtn,
              background: exito ? "#10b981" : guardando ? "#475569" : "#2563eb",
              cursor: guardando ? "not-allowed" : "pointer",
            }}
          >
            {guardando ? "Guardando..." : exito ? "✓ Publicado" : "Publicar"}
          </button>
        </div>
      </div>

      {/* ── CUERPO: panel + preview ── */}
      {cargando ? (
        <div style={fs.loading}>
          <span style={{ fontSize: 32 }}>⚙️</span>
          <span style={{ fontSize: 14, color: "#64748b" }}>Cargando editor...</span>
        </div>
      ) : (
        <div style={fs.body}>

          {/* Panel lateral (colapsable) */}
          {panelAbierto && (
            <div style={fs.panel}>
              <PanelEditor
                datos={datos}
                bannerPreview={bannerPreview}
                layout={layout}
                onLayoutChange={onLayoutChange}
                seccionActiva={seccionActiva}
                setSeccionActiva={setSeccionActiva}
                onChange={onChange}
                onBannerChange={onBannerChange}
                onToggleSeccion={onToggleSeccion}
                onDeleteSeccion={onDeleteSeccion}
                onAddSeccion={onAddSeccion}
                onSeccionConfigChange={onSeccionConfigChange}
                onAplicarPlantilla={aplicarPlantilla}
                guardando={false}
                exito={false}
                error={error}
                onGuardar={handleGuardar}
                ocultarHeader
              />
            </div>
          )}

          {/* Preview */}
          <div style={fs.preview}>
            <PreviewStore
              vista={vista}
              setVista={setVista}
              slug={slug}
              iframeKey={iframeKey}
              onReload={() => setIframeKey(k => k + 1)}
            />
          </div>

        </div>
      )}

    </div>
  );
}

/* ─── ESTILOS ─── */
const fs = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    backgroundColor: "#0B1628",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Sora', 'Inter', sans-serif",
  },

  // Topbar
  topbar: {
    height: "52px",
    flexShrink: 0,
    backgroundColor: "#0d1e35",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 16px",
    gap: 12,
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "none",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    fontWeight: 500,
    padding: "6px 12px",
    cursor: "pointer",
    flexShrink: 0,
    transition: "all 0.15s",
  },
  topCenter: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  topTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "rgba(255,255,255,0.9)",
    letterSpacing: "-0.01em",
  },
  topSlug: {
    fontSize: 11,
    color: "rgba(255,255,255,0.3)",
    fontFamily: "monospace",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: "2px 8px",
    borderRadius: 5,
  },
  topRight: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  topBtn: {
    padding: "6px 12px",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  vistasToggle: {
    display: "flex",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 8,
    padding: 2,
    gap: 2,
    border: "1px solid rgba(255,255,255,0.08)",
  },
  vistaBtn: {
    padding: "4px 10px",
    border: "none",
    borderRadius: 6,
    fontSize: 13,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  publishBtn: {
    padding: "7px 18px",
    border: "none",
    borderRadius: 9,
    color: "white",
    fontSize: 13,
    fontWeight: 700,
    transition: "all 0.2s",
    letterSpacing: "-0.01em",
  },

  // Cuerpo
  body: {
    flex: 1,
    display: "flex",
    overflow: "hidden",
  },
  panel: {
    width: 300,
    flexShrink: 0,
    overflowY: "auto",
    borderRight: "1px solid rgba(255,255,255,0.06)",
    backgroundColor: "#0B1628",
  },
  preview: {
    flex: 1,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },

  loading: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
};

// ── Estilos de la pantalla de entrada (dentro del dashboard) ─────────────────
const s = {
  entryWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    padding: 40,
  },
  entryCard: {
    textAlign: "center",
    maxWidth: 400,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 14,
  },
  entryIcon: { fontSize: 52 },
  entryTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: "#0B1628",
    letterSpacing: "-0.02em",
    margin: 0,
  },
  entrySub: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 1.6,
    margin: 0,
  },
  entryBtn: {
    padding: "12px 28px",
    background: "#2563eb",
    border: "none",
    borderRadius: 12,
    color: "white",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    marginTop: 8,
    letterSpacing: "-0.01em",
  },
};