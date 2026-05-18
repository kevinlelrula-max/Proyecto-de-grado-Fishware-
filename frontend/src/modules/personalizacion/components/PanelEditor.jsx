import { useRef, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const TIPOS_INFO = {
  hero:        { label: "Portada",          emoji: "🖼️", fija: true,  desc: "Banner y título principal" },
  catalogo:    { label: "Catálogo",         emoji: "🛒", fija: true,  desc: "Productos disponibles" },
  nosotros:    { label: "Sobre nosotros",   emoji: "🏢", fija: false, desc: "Historia de tu negocio" },
  contacto:    { label: "Contacto & Redes", emoji: "📱", fija: true,  desc: "Info y redes sociales" },
  texto_libre: { label: "Bloque de texto",  emoji: "📝", fija: false, desc: "Texto personalizable" },
};

const TIPOS_AGREGABLES = [
  { tipo: "texto_libre", label: "Bloque de texto", emoji: "📝", desc: "Título + texto libre, color de fondo personalizable" },
  { tipo: "nosotros",    label: "Sobre nosotros",  emoji: "🏢", desc: "Presenta tu negocio a los clientes" },
];

export default function PanelEditor({
  datos, bannerPreview, layout,
  seccionActiva, setSeccionActiva,
  onChange, onBannerChange,
  onLayoutChange, onToggleSeccion, onDeleteSeccion, onAddSeccion, onSeccionConfigChange,
  guardando, exito, error, onGuardar,
  ocultarHeader, // ← prop nueva: oculta el header cuando el editor está en fullscreen
}) {
  const bannerRef      = useRef(null);
  const [draggingIdx, setDraggingIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const [showAgregar, setShowAgregar] = useState(false);

  const bannerSrc = bannerPreview?.startsWith("data:") ? bannerPreview
    : bannerPreview ? `${API_BASE}${bannerPreview}` : null;

  function onDragStart(e, idx) { setDraggingIdx(idx); e.dataTransfer.effectAllowed = "move"; }
  function onDragOver(e, idx)  { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDragOverIdx(idx); }
  function onDrop(e, idx) {
    e.preventDefault();
    if (draggingIdx === null || draggingIdx === idx) return;
    const copia = [...layout];
    const [moved] = copia.splice(draggingIdx, 1);
    copia.splice(idx, 0, moved);
    onLayoutChange(copia);
    setDraggingIdx(null); setDragOverIdx(null);
  }
  function onDragEnd() { setDraggingIdx(null); setDragOverIdx(null); }

  const seccionSeleccionada = layout.find(s => s.id === seccionActiva);

  return (
    <div style={s.panel}>

      {/* Header — se oculta cuando está en modo fullscreen (el topbar del editor lo reemplaza) */}
      {!ocultarHeader && (
        <div style={s.header}>
          <div>
            <div style={s.headerTitle}>Editor de tienda</div>
            <div style={s.headerSub}>Arrastra para reordenar secciones</div>
          </div>
          <button
            onClick={onGuardar}
            disabled={guardando}
            style={{
              ...s.btnGuardar,
              background: exito ? "#10b981" : guardando ? "#64748b" : "linear-gradient(135deg,#00C9A7,#0099FF)",
              cursor: guardando ? "not-allowed" : "pointer",
            }}
          >
            {guardando ? "Guardando..." : exito ? "✓ Publicado" : "Publicar"}
          </button>
        </div>
      )}

      {error && <div style={s.errorMsg}>{error}</div>}

      {/* Secciones */}
      <div style={s.seccionesLabel}>Secciones</div>
      <div style={s.lista}>
        {layout.map((sec, idx) => {
          const info     = TIPOS_INFO[sec.tipo] || TIPOS_INFO.texto_libre;
          const activo   = seccionActiva === sec.id;
          const isDragging = draggingIdx === idx;
          const isDragOver = dragOverIdx === idx;
          return (
            <div
              key={sec.id}
              draggable
              onDragStart={e => onDragStart(e, idx)}
              onDragOver={e => onDragOver(e, idx)}
              onDrop={e => onDrop(e, idx)}
              onDragEnd={onDragEnd}
              style={{
                ...s.seccionItem,
                opacity: isDragging ? 0.4 : 1,
                borderColor: isDragOver ? "#00C9A7" : activo ? "rgba(0,201,167,0.4)" : "rgba(255,255,255,0.06)",
                background: isDragOver ? "rgba(0,201,167,0.08)" : activo ? "rgba(0,201,167,0.06)" : "transparent",
              }}
            >
              <div style={s.dragHandle} title="Arrastra para mover">⋮⋮</div>
              <button
                onClick={() => onToggleSeccion(sec.id)}
                style={{ ...s.eyeBtn, opacity: sec.visible ? 1 : 0.35 }}
                title={sec.visible ? "Ocultar sección" : "Mostrar sección"}
              >
                {sec.visible ? "👁" : "🙈"}
              </button>
              <button
                onClick={() => setSeccionActiva(activo ? null : sec.id)}
                style={s.seccionNombreBtn}
              >
                <span style={s.seccionEmoji}>{info.emoji}</span>
                <div>
                  <div style={{ ...s.seccionLabel, color: activo ? "#00C9A7" : "#e2e8f0" }}>
                    {info.label}
                  </div>
                  {!sec.visible && <div style={s.ocultaTag}>Oculta</div>}
                </div>
              </button>
              <button
                onClick={() => setSeccionActiva(activo ? null : sec.id)}
                style={{ ...s.chevronBtn, color: activo ? "#00C9A7" : "#2D4060" }}
              >
                {activo ? "▲" : "▾"}
              </button>
              {!info.fija && (
                <button
                  onClick={() => { onDeleteSeccion(sec.id); if (activo) setSeccionActiva(null); }}
                  style={s.deleteBtn}
                  title="Eliminar sección"
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Agregar bloque */}
      <div style={{ padding: "10px 14px", position: "relative" }}>
        <button onClick={() => setShowAgregar(v => !v)} style={s.btnAgregar}>
          + Agregar bloque
        </button>
        {showAgregar && (
          <div style={s.agregarMenu}>
            {TIPOS_AGREGABLES.map(op => {
              const yaExiste = op.tipo !== "texto_libre" && layout.some(s => s.tipo === op.tipo);
              return (
                <button
                  key={op.tipo}
                  disabled={yaExiste}
                  onClick={() => {
                    if (!yaExiste) {
                      onAddSeccion(op.tipo);
                      setShowAgregar(false);
                      setSeccionActiva(`${op.tipo}_${Date.now()}`);
                    }
                  }}
                  style={{ ...s.agregarItem, opacity: yaExiste ? 0.4 : 1, cursor: yaExiste ? "not-allowed" : "pointer" }}
                >
                  <span style={{ fontSize: 20 }}>{op.emoji}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{op.label}</div>
                    <div style={{ fontSize: 11, color: "#4A6080" }}>{op.desc}</div>
                    {yaExiste && <div style={{ fontSize: 10, color: "#f59e0b" }}>Ya existe en tu tienda</div>}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div style={s.divider} />

      {/* Config de sección activa */}
      {seccionSeleccionada ? (
        <div style={s.configArea}>
          <div style={s.configTitulo}>
            {TIPOS_INFO[seccionSeleccionada.tipo]?.emoji} Configurar: {TIPOS_INFO[seccionSeleccionada.tipo]?.label}
          </div>
          <ConfigSeccion
            seccion={seccionSeleccionada}
            datos={datos}
            bannerSrc={bannerSrc}
            bannerRef={bannerRef}
            onChange={onChange}
            onBannerChange={onBannerChange}
            onSeccionConfigChange={onSeccionConfigChange}
          />
          <input
            ref={bannerRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            style={{ display: "none" }}
            onChange={e => { const f = e.target.files?.[0]; if (f) onBannerChange(f); }}
          />
        </div>
      ) : (
        <div style={s.emptyConfig}>
          <span style={{ fontSize: 24, opacity: 0.4 }}>👆</span>
          <span style={{ fontSize: 12, color: "#2D4060" }}>Selecciona una sección para editarla</span>
        </div>
      )}
    </div>
  );
}

// ── Config por tipo de sección ───────────────────────────────────────────────
function ConfigSeccion({ seccion, datos, bannerSrc, bannerRef, onChange, onBannerChange, onSeccionConfigChange }) {
  const cfg = (campo, valor) => onSeccionConfigChange(seccion.id, campo, valor);

  if (seccion.tipo === "hero") return (
    <div style={f.wrap}>
      <Field label="Color de marca">
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="color" value={datos.color_primario || "#0F6E56"}
            onChange={e => onChange("color_primario", e.target.value)} style={f.colorInput} />
          <input type="text" value={datos.color_primario || ""} placeholder="#0F6E56"
            onChange={e => onChange("color_primario", e.target.value)} style={f.input} />
        </div>
      </Field>
      <Field label="Banner de fondo">
        <div onClick={() => bannerRef.current?.click()} style={{ ...f.bannerUpload, overflow: "hidden" }}>
          {bannerSrc
            ? <img src={bannerSrc} alt="" style={{ width: "100%", height: 80, objectFit: "cover", borderRadius: 8 }} />
            : <><span style={{ fontSize: 20 }}>🖼️</span><span style={{ fontSize: 11, color: "#4A6080" }}>Clic para subir (1200×400px)</span></>
          }
        </div>
      </Field>
      <Field label="Descripción breve">
        <textarea value={datos.descripcion || ""} onChange={e => onChange("descripcion", e.target.value)}
          placeholder="Productos frescos a tu puerta..." rows={2} style={f.textarea} />
      </Field>
      <Field label="Título principal">
        <input type="text" value={datos.hero_titulo || ""} onChange={e => onChange("hero_titulo", e.target.value)}
          placeholder="Bienvenido a nuestra tienda" style={f.input} />
      </Field>
      <Field label="Subtítulo">
        <input type="text" value={datos.hero_subtitulo || ""} onChange={e => onChange("hero_subtitulo", e.target.value)}
          placeholder="Calidad garantizada" style={f.input} />
      </Field>
      <Field label="Texto del botón">
        <input type="text" value={datos.hero_btn_texto || ""} onChange={e => onChange("hero_btn_texto", e.target.value)}
          placeholder="Ver catálogo" style={f.input} />
      </Field>
      <Field label="Horario de atención">
        <input type="text" value={datos.horario || ""} onChange={e => onChange("horario", e.target.value)}
          placeholder="Lun – Sáb: 7am – 6pm" style={f.input} />
      </Field>
    </div>
  );

  if (seccion.tipo === "catalogo") return (
    <div style={f.infoBox}>
      Los productos se gestionan desde la sección <strong style={{ color: "#00C9A7" }}>Productos</strong> del dashboard. Esta sección siempre muestra los productos con stock disponible.
    </div>
  );

  if (seccion.tipo === "nosotros") return (
    <div style={f.wrap}>
      <Field label="Título de la sección">
        <input type="text" value={datos.nosotros_titulo || ""} onChange={e => onChange("nosotros_titulo", e.target.value)}
          placeholder="¿Quiénes somos?" style={f.input} />
      </Field>
      <Field label="Contenido">
        <textarea value={datos.nosotros_contenido || ""} onChange={e => onChange("nosotros_contenido", e.target.value)}
          placeholder="Cuéntale a tus clientes sobre tu negocio..." rows={5} style={f.textarea} />
      </Field>
    </div>
  );

  if (seccion.tipo === "texto_libre") return (
    <div style={f.wrap}>
      <Field label="Título">
        <input type="text" value={seccion.config?.titulo || ""} onChange={e => cfg("titulo", e.target.value)}
          placeholder="Ej: Oferta especial" style={f.input} />
      </Field>
      <Field label="Contenido">
        <textarea value={seccion.config?.contenido || ""} onChange={e => cfg("contenido", e.target.value)}
          placeholder="Escribe aquí el texto..." rows={4} style={f.textarea} />
      </Field>
      <Field label="Color de fondo">
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="color" value={seccion.config?.color_fondo || "#ffffff"}
            onChange={e => cfg("color_fondo", e.target.value)} style={f.colorInput} />
          <input type="text" value={seccion.config?.color_fondo || "#ffffff"}
            onChange={e => cfg("color_fondo", e.target.value)} style={f.input} />
        </div>
      </Field>
      <Field label="Color de texto">
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="color" value={seccion.config?.color_texto || "#0f172a"}
            onChange={e => cfg("color_texto", e.target.value)} style={f.colorInput} />
          <input type="text" value={seccion.config?.color_texto || "#0f172a"}
            onChange={e => cfg("color_texto", e.target.value)} style={f.input} />
        </div>
      </Field>
      <Field label="Alineación del texto">
        <div style={{ display: "flex", gap: 6 }}>
          {["left", "center", "right"].map(al => (
            <button key={al} onClick={() => cfg("alineacion", al)}
              style={{
                ...f.alineBtn,
                background: (seccion.config?.alineacion || "center") === al ? "rgba(0,201,167,0.2)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${(seccion.config?.alineacion || "center") === al ? "#00C9A7" : "rgba(255,255,255,0.1)"}`,
                color: (seccion.config?.alineacion || "center") === al ? "#00C9A7" : "#4A6080",
              }}>
              {{ left: "←", center: "↔", right: "→" }[al]}
            </button>
          ))}
        </div>
      </Field>
    </div>
  );

  if (seccion.tipo === "contacto") return (
    <div style={f.wrap}>
      <Field label="Teléfono">
        <input type="text" value={datos.telefono || ""} onChange={e => onChange("telefono", e.target.value)}
          placeholder="+57 300 123 4567" style={f.input} />
      </Field>
      <Field label="Email">
        <input type="email" value={datos.email || ""} onChange={e => onChange("email", e.target.value)}
          placeholder="contacto@mitienda.com" style={f.input} />
      </Field>
      <Field label="Dirección">
        <input type="text" value={datos.direccion || ""} onChange={e => onChange("direccion", e.target.value)}
          placeholder="Cra. 5 #12-30, Bogotá" style={f.input} />
      </Field>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#2D4060", textTransform: "uppercase", letterSpacing: "0.08em", margin: "10px 0 8px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 10 }}>
        Redes sociales
      </div>
      <Field label="📱 WhatsApp">
        <input type="text" value={datos.whatsapp || ""} onChange={e => onChange("whatsapp", e.target.value)}
          placeholder="573001234567" style={f.input} />
      </Field>
      <Field label="📸 Instagram">
        <input type="text" value={datos.instagram || ""} onChange={e => onChange("instagram", e.target.value)}
          placeholder="@mitienda" style={f.input} />
      </Field>
      <Field label="👍 Facebook">
        <input type="text" value={datos.facebook || ""} onChange={e => onChange("facebook", e.target.value)}
          placeholder="mitienda" style={f.input} />
      </Field>
    </div>
  );

  return null;
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#4A6080", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </div>
      {children}
    </div>
  );
}

const s = {
  panel: { width: "100%", background: "#0B1628", display: "flex", flexDirection: "column", overflowY: "auto", height: "100%" },
  header: { padding: "16px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexShrink: 0 },
  headerTitle: { fontSize: 14, fontWeight: 700, color: "#e2e8f0" },
  headerSub: { fontSize: 11, color: "#2D4060", marginTop: 2 },
  btnGuardar: { padding: "8px 16px", border: "none", borderRadius: 9, color: "white", fontSize: 12, fontWeight: 700, flexShrink: 0, transition: "all 0.2s" },
  errorMsg: { margin: "0 14px 8px", padding: "8px 12px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, fontSize: 12, color: "#fca5a5" },
  seccionesLabel: { padding: "12px 14px 6px", fontSize: 10, fontWeight: 700, color: "#2D4060", textTransform: "uppercase", letterSpacing: "0.1em" },
  lista: { padding: "0 10px", display: "flex", flexDirection: "column", gap: 3 },
  seccionItem: { display: "flex", alignItems: "center", gap: 6, padding: "8px 8px", borderRadius: 10, border: "1px solid", cursor: "default", transition: "all 0.15s", userSelect: "none" },
  dragHandle: { color: "#2D4060", fontSize: 14, cursor: "grab", flexShrink: 0, lineHeight: 1, letterSpacing: "-2px" },
  eyeBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 14, flexShrink: 0, padding: 0, lineHeight: 1 },
  seccionNombreBtn: { flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, textAlign: "left", padding: 0, minWidth: 0 },
  seccionEmoji: { fontSize: 16, flexShrink: 0 },
  seccionLabel: { fontSize: 12, fontWeight: 600, lineHeight: 1.3 },
  ocultaTag: { fontSize: 10, color: "#f59e0b", marginTop: 2 },
  chevronBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 13, padding: "0 4px", flexShrink: 0 },
  deleteBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#ef4444", padding: "2px 4px", flexShrink: 0, opacity: 0.7, lineHeight: 1 },
  btnAgregar: { width: "100%", padding: "9px 0", background: "rgba(0,201,167,0.08)", border: "1px dashed rgba(0,201,167,0.25)", borderRadius: 9, color: "#00C9A7", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  agregarMenu: { position: "absolute", top: "calc(100% - 4px)", left: 14, right: 14, background: "#0f2137", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.4)", zIndex: 50, overflow: "hidden" },
  agregarItem: { display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", background: "none", border: "none", width: "100%", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  divider: { height: 1, background: "rgba(255,255,255,0.06)", margin: "6px 0", flexShrink: 0 },
  configArea: { padding: "0 14px 24px", flex: 1, overflowY: "auto" },
  configTitulo: { fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", padding: "10px 0 10px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 14 },
  emptyConfig: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: 30 },
};

const f = {
  wrap: { display: "flex", flexDirection: "column" },
  input: { width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "7px 10px", fontSize: 13, color: "#e2e8f0", outline: "none", boxSizing: "border-box", fontFamily: "inherit" },
  textarea: { width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "7px 10px", fontSize: 13, color: "#e2e8f0", outline: "none", resize: "none", boxSizing: "border-box", fontFamily: "inherit", lineHeight: 1.5 },
  colorInput: { width: 36, height: 32, borderRadius: 7, border: "1px solid rgba(255,255,255,0.1)", padding: 2, cursor: "pointer", background: "none", flexShrink: 0 },
  bannerUpload: { border: "2px dashed rgba(255,255,255,0.1)", borderRadius: 9, padding: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer" },
  alineBtn: { flex: 1, padding: "6px 0", border: "none", borderRadius: 7, fontSize: 16, cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit" },
  infoBox: { background: "rgba(0,201,167,0.06)", border: "1px solid rgba(0,201,167,0.15)", borderRadius: 10, padding: "12px 14px", fontSize: 12, color: "#7A8BA0", lineHeight: 1.6 },
};