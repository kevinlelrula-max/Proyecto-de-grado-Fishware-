import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
const TOKEN_KEY = "token";

const EJEMPLOS = [
  "Pescadería familiar con productos frescos del mar, delivery a domicilio",
  "Tienda de ropa deportiva para jóvenes, colores vibrantes y energéticos",
  "Panadería artesanal con panes y tortas, ambiente cálido y familiar",
  "Tienda de tecnología y accesorios, diseño moderno y minimalista",
  "Floristería con arreglos personalizados, colores suaves y elegantes",
  "Restaurante de comida rápida, menú variado y precios accesibles",
];

const VARIANTE_LABELS = {
  oscuro: "Oscuro", lateral: "Panel lateral", minimalista: "Minimalista",
  revista: "Revista", negrita: "Negrita", gradiente: "Gradiente",
};
const TARJETA_LABELS = {
  estandar: "Estándar", minimalista: "Minimalista",
  oscuro: "Oscura", boutique: "Boutique", horizontal: "Horizontal",
};
const SECCION_LABELS = {
  nosotros: "Sobre nosotros", faq: "Preguntas frecuentes",
  galeria: "Galería", testimonios: "Testimonios",
};

function convertirAPlantilla(diseno) {
  const seccionesBase = [
    { tipo: "hero",     config: { variante: diseno.hero_variante || "oscuro" } },
    { tipo: "catalogo", config: { estilo_tarjeta: diseno.estilo_tarjeta || "estandar" } },
  ];
  const seccionesExtra = (diseno.secciones_extra || [])
    .filter(t => ["nosotros", "faq", "galeria", "testimonios"].includes(t))
    .map(tipo => ({ tipo, config: {} }));
  return {
    color_primario:     diseno.color_primario,
    color_secundario:   diseno.color_secundario,
    fuente:             diseno.fuente,
    hero_titulo:        diseno.hero_titulo,
    hero_subtitulo:     diseno.hero_subtitulo,
    hero_btn_texto:     diseno.hero_btn_texto,
    nosotros_titulo:    diseno.nosotros_titulo,
    nosotros_contenido: diseno.nosotros_contenido,
    horario:            diseno.horario || "",
    footer_texto:       "",
    secciones: [...seccionesBase, ...seccionesExtra, { tipo: "contacto", config: {} }],
  };
}

export default function ModalDisenoIA({ onCerrar, onAplicar }) {
  const [paso, setPaso]           = useState("input"); // input | loading | preview
  const [descripcion, setDescripcion] = useState("");
  const [diseno, setDiseno]       = useState(null);
  const [error, setError]         = useState(null);
  const [confirmando, setConfirmando] = useState(false);

  const handleGenerar = async () => {
    if (!descripcion.trim()) return;
    setPaso("loading");
    setError(null);
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const res = await fetch(`${API_BASE}/api/insight/generar-diseno`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ descripcion }),
      });
      if (!res.ok) throw new Error("Error al generar el diseño");
      const data = await res.json();
      setDiseno(data);
      setPaso("preview");
    } catch (err) {
      setError(err.message);
      setPaso("input");
    }
  };

  const handleAplicar = () => {
    if (!confirmando) { setConfirmando(true); return; }
    onAplicar(convertirAPlantilla(diseno));
    onCerrar();
  };

  return (
    <div style={s.overlay} onClick={onCerrar}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={s.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={s.sparkle}>✦</div>
            <div>
              <div style={s.titulo}>Diseñar tienda con IA</div>
              <div style={s.subtitulo}>Describe tu negocio y la IA crea un diseño único para ti</div>
            </div>
          </div>
          <button style={s.cerrarBtn} onClick={onCerrar}>✕</button>
        </div>

        {/* ── PASO: INPUT ── */}
        {paso === "input" && (
          <div style={s.body}>
            <textarea
              style={s.textarea}
              placeholder="Ej: Tengo una pescadería familiar, vendemos productos del mar frescos, hacemos entregas a domicilio. Me gustan los colores verde y azul oscuro..."
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              rows={5}
              autoFocus
            />

            {error && (
              <div style={s.errorBox}>⚠ {error} — intenta de nuevo</div>
            )}

            <div style={s.ejemplosLabel}>O elige un ejemplo para empezar:</div>
            <div style={s.ejemplosWrap}>
              {EJEMPLOS.map((ej, i) => (
                <button key={i} style={s.ejemploChip} onClick={() => setDescripcion(ej)}>
                  {ej}
                </button>
              ))}
            </div>

            <button
              style={{ ...s.btnGenerar, opacity: descripcion.trim() ? 1 : 0.4, cursor: descripcion.trim() ? "pointer" : "not-allowed" }}
              onClick={handleGenerar}
              disabled={!descripcion.trim()}
            >
              ✦ Generar diseño
            </button>
          </div>
        )}

        {/* ── PASO: LOADING ── */}
        {paso === "loading" && (
          <div style={s.loadingWrap}>
            <div style={s.loadingOrb} />
            <p style={s.loadingTitle}>Creando tu diseño...</p>
            <p style={s.loadingDesc}>La IA está analizando tu negocio y eligiendo colores, estilos y secciones ideales para ti.</p>
            <div style={s.loadingDots}>
              <span style={{ ...s.dot, animationDelay: "0s" }} />
              <span style={{ ...s.dot, animationDelay: "0.2s" }} />
              <span style={{ ...s.dot, animationDelay: "0.4s" }} />
            </div>
          </div>
        )}

        {/* ── PASO: PREVIEW ── */}
        {paso === "preview" && diseno && (
          <div style={s.body}>
            {/* Preview visual de colores */}
            <div style={{ ...s.previewCard, backgroundColor: diseno.color_secundario }}>
              <div style={s.previewNav}>
                <div style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: diseno.color_primario, flexShrink: 0 }} />
                <div style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.15)" }} />
                <div style={{ ...s.previewNavBtn, backgroundColor: diseno.color_primario }} />
              </div>
              <div style={s.previewHeroArea}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 4, lineHeight: 1.2 }}>{diseno.hero_titulo}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", marginBottom: 10 }}>{diseno.hero_subtitulo}</div>
                <div style={{ ...s.previewBtn, backgroundColor: diseno.color_primario }}>{diseno.hero_btn_texto}</div>
              </div>
              <div style={s.previewCardRow}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ ...s.previewMiniCard, backgroundColor: i % 2 === 0 ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)", borderTop: `2px solid ${diseno.color_primario}` }} />
                ))}
              </div>
            </div>

            {/* Detalles del diseño */}
            <div style={s.detallesGrid}>
              <div style={s.detalleItem}>
                <div style={s.detalleLabel}>Colores</div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <div style={{ width: 22, height: 22, borderRadius: 5, backgroundColor: diseno.color_primario, border: "1px solid rgba(255,255,255,0.15)" }} />
                  <div style={{ width: 22, height: 22, borderRadius: 5, backgroundColor: diseno.color_secundario, border: "1px solid rgba(255,255,255,0.15)" }} />
                  <span style={{ fontSize: 11, color: "#64748b" }}>{diseno.color_primario}</span>
                </div>
              </div>
              <div style={s.detalleItem}>
                <div style={s.detalleLabel}>Tipografía</div>
                <div style={s.detalleValor}>{diseno.fuente}</div>
              </div>
              <div style={s.detalleItem}>
                <div style={s.detalleLabel}>Estilo portada</div>
                <div style={s.detalleValor}>{VARIANTE_LABELS[diseno.hero_variante] || diseno.hero_variante}</div>
              </div>
              <div style={s.detalleItem}>
                <div style={s.detalleLabel}>Estilo tarjetas</div>
                <div style={s.detalleValor}>{TARJETA_LABELS[diseno.estilo_tarjeta] || diseno.estilo_tarjeta}</div>
              </div>
            </div>

            {/* Secciones que se van a crear */}
            <div style={{ marginBottom: 16 }}>
              <div style={s.detalleLabel}>Secciones incluidas</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                {["Portada", "Catálogo",
                  ...(diseno.secciones_extra || []).map(t => SECCION_LABELS[t] || t),
                  "Contacto"
                ].map(sec => (
                  <span key={sec} style={s.seccionChip}>{sec}</span>
                ))}
              </div>
            </div>

            {/* Texto generado */}
            {diseno.nosotros_contenido && (
              <div style={s.textPreview}>
                <div style={s.detalleLabel}>Texto "Sobre nosotros" generado</div>
                <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6, margin: "6px 0 0" }}>{diseno.nosotros_contenido}</p>
              </div>
            )}

            {/* Botones */}
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button style={s.btnVolver} onClick={() => { setPaso("input"); setConfirmando(false); }}>
                ← Regenerar
              </button>
              <button style={{ ...s.btnAplicar, backgroundColor: confirmando ? "#f59e0b" : "#00C9A7", flex: 1 }} onClick={handleAplicar}>
                {confirmando ? "⚠ Confirmar — reemplazará el diseño actual" : "✦ Aplicar diseño"}
              </button>
            </div>
            {confirmando && (
              <p style={{ fontSize: 11, color: "#64748b", textAlign: "center", marginTop: 6 }}>
                Esto reemplazará los colores, tipografía y secciones actuales.
              </p>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse-orb {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.08); opacity: 1; }
        }
        @keyframes bounce-dot {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}

const s = {
  overlay: { position: "fixed", inset: 0, zIndex: 10001, backgroundColor: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backdropFilter: "blur(6px)" },
  modal: { backgroundColor: "#0d1e35", borderRadius: 18, border: "1px solid rgba(255,255,255,0.1)", width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", display: "flex", flexDirection: "column" },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "20px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0, gap: 12 },
  sparkle: { width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#00C9A7,#0099FF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "white", flexShrink: 0 },
  titulo: { fontSize: 15, fontWeight: 700, color: "#e2e8f0" },
  subtitulo: { fontSize: 12, color: "#4A6080", marginTop: 2 },
  cerrarBtn: { background: "none", border: "none", color: "#4A6080", fontSize: 18, cursor: "pointer", lineHeight: 1, padding: "2px 4px", flexShrink: 0 },

  body: { padding: "20px", display: "flex", flexDirection: "column", gap: 14 },
  textarea: { width: "100%", background: "#0a1628", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "12px 14px", fontSize: 13, color: "#e2e8f0", outline: "none", resize: "none", boxSizing: "border-box", lineHeight: 1.6, fontFamily: "inherit" },
  errorBox: { padding: "8px 12px", backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, fontSize: 12, color: "#fca5a5" },

  ejemplosLabel: { fontSize: 11, fontWeight: 600, color: "#2D4060", textTransform: "uppercase", letterSpacing: "0.06em" },
  ejemplosWrap: { display: "flex", flexDirection: "column", gap: 6 },
  ejemploChip: { textAlign: "left", padding: "8px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 12, color: "#7A9BB5", cursor: "pointer", transition: "all 0.15s" },

  btnGenerar: { padding: "13px 0", background: "linear-gradient(135deg,#00C9A7,#0099FF)", border: "none", borderRadius: 12, color: "white", fontSize: 14, fontWeight: 700, width: "100%", letterSpacing: "0.02em" },

  // Loading
  loadingWrap: { padding: "48px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center" },
  loadingOrb: { width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#00C9A7,#0099FF)", animation: "pulse-orb 2s ease-in-out infinite", boxShadow: "0 0 40px rgba(0,201,167,0.4)" },
  loadingTitle: { fontSize: 17, fontWeight: 700, color: "#e2e8f0", margin: 0 },
  loadingDesc: { fontSize: 13, color: "#4A6080", lineHeight: 1.6, maxWidth: 320, margin: 0 },
  loadingDots: { display: "flex", gap: 8 },
  dot: { width: 8, height: 8, borderRadius: "50%", backgroundColor: "#00C9A7", display: "inline-block", animation: "bounce-dot 1.2s ease-in-out infinite" },

  // Preview
  previewCard: { borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" },
  previewNav: { display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", backgroundColor: "rgba(0,0,0,0.2)" },
  previewNavBtn: { width: 48, height: 16, borderRadius: 4, opacity: 0.8 },
  previewHeroArea: { padding: "20px 20px 16px", minHeight: 90 },
  previewBtn: { display: "inline-block", padding: "5px 12px", borderRadius: 6, fontSize: 10, fontWeight: 700, color: "white" },
  previewCardRow: { display: "flex", gap: 8, padding: "0 14px 14px" },
  previewMiniCard: { flex: 1, height: 40, borderRadius: 8 },

  detallesGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  detalleItem: { backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 12px" },
  detalleLabel: { fontSize: 10, fontWeight: 700, color: "#2D4060", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 },
  detalleValor: { fontSize: 13, fontWeight: 600, color: "#e2e8f0" },

  seccionChip: { fontSize: 11, padding: "3px 10px", borderRadius: 8, backgroundColor: "rgba(0,201,167,0.1)", color: "#00C9A7", border: "1px solid rgba(0,201,167,0.2)" },
  textPreview: { backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "12px 14px", border: "1px solid rgba(255,255,255,0.06)" },

  btnVolver: { padding: "12px 18px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#94a3b8", fontSize: 13, fontWeight: 600, cursor: "pointer", flexShrink: 0 },
  btnAplicar: { padding: "12px 0", border: "none", borderRadius: 12, color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "background 0.2s" },
};
