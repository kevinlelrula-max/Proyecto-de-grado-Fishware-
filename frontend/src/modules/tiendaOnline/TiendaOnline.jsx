import { useState, useEffect, useCallback } from "react";
import { useConfiguracion } from "../configuracion/hooks/useConfiguracion";
import { usePersonalizacion } from "./hooks/usePersonalizacion";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const SECCIONES = [
  {
    key: "apariencia",
    label: "Apariencia",
    icon: "🎨",
    desc: "Colores y banner",
    subsecciones: [
      { key: "color",  label: "Color de marca", icon: "🎨", desc: "Color principal de tu tienda" },
      { key: "banner", label: "Banner",          icon: "🖼️", desc: "Imagen de fondo de tu portada" },
    ],
  },
  {
    key: "contenido",
    label: "Contenido",
    icon: "✍️",
    desc: "Textos de tu tienda",
    subsecciones: [
      { key: "portada",  label: "Portada",        icon: "🏠", desc: "Título y botón de bienvenida" },
      { key: "nosotros", label: "Sobre nosotros",  icon: "📖", desc: "Descripción de tu negocio" },
      { key: "horario",  label: "Horario",         icon: "🕐", desc: "Horario de atención" },
    ],
  },
  {
    key: "contacto",
    label: "Contacto",
    icon: "📱",
    desc: "Cómo contactarte",
    subsecciones: [
      { key: "redes", label: "Redes sociales", icon: "📲", desc: "WhatsApp, Instagram, Facebook" },
      { key: "info",  label: "Información",    icon: "📍", desc: "Teléfono, email y dirección" },
    ],
  },
];

export default function TiendaOnline() {
  const [seccionAbierta, setSeccionAbierta]     = useState("apariencia");
  const [subseccionActiva, setSubseccionActiva] = useState("color");
  const [vistaMovil, setVistaMovil]             = useState(false);
  const [iframeKey, setIframeKey]               = useState(0);

  const { empresa, cargarConfiguracion, cargando, handleEmpresaChange } = useConfiguracion();
  const { guardando, error, exito, bannerPreview, handleBannerChange, quitarBanner, guardar } = usePersonalizacion(empresa, cargarConfiguracion);

  useEffect(() => { cargarConfiguracion(); }, [cargarConfiguracion]);

  const slug       = empresa?.slug || localStorage.getItem("empresa_slug") || "";
  const linkTienda = slug ? `${window.location.origin}/tienda/${slug}` : null;

  const completitud = (() => {
    const campos = [empresa?.descripcion, empresa?.color_primario, empresa?.banner_url, empresa?.horario, empresa?.whatsapp || empresa?.instagram || empresa?.facebook, empresa?.telefono];
    return Math.round((campos.filter(Boolean).length / campos.length) * 100);
  })();

  const handleGuardar = useCallback(async () => {
    await guardar({
      nombre: empresa.nombre, nit: empresa.nit,
      email: empresa.email, telefono: empresa.telefono,
      direccion: empresa.direccion, descripcion: empresa.descripcion,
      color_primario: empresa.color_primario, instagram: empresa.instagram,
      whatsapp: empresa.whatsapp, facebook: empresa.facebook,
      horario: empresa.horario, hero_titulo: empresa.hero_titulo,
      hero_subtitulo: empresa.hero_subtitulo, hero_btn_texto: empresa.hero_btn_texto,
      nosotros_titulo: empresa.nosotros_titulo, nosotros_contenido: empresa.nosotros_contenido,
    });
    setIframeKey(k => k + 1);
  }, [empresa, guardar]);

  if (cargando) return (
    <div style={s.loading}>
      <span style={{ fontSize: 36 }}>🎨</span>
      <p style={{ fontSize: 14, color: "#94a3b8" }}>Cargando Studio...</p>
    </div>
  );

  return (
    <div style={s.studio}>

      {/* ── TOPBAR ── */}
      <div style={s.topbar}>
        <div style={s.topbarLeft}>
          <span style={s.studioLabel}>🎨 Studio</span>
          <div style={s.completitudWrap}>
            <div style={s.completitudBar}>
              <div style={{ ...s.completitudFill, width: `${completitud}%`, backgroundColor: completitud === 100 ? "#0F6E56" : completitud >= 60 ? "#f59e0b" : "#ef4444" }} />
            </div>
            <span style={s.completitudPct}>{completitud}%</span>
          </div>
        </div>
        <div style={s.topbarRight}>
          <div style={s.vistaToggle}>
            <button style={{ ...s.vistaBtn, backgroundColor: !vistaMovil ? "#0B1628" : "transparent", color: !vistaMovil ? "white" : "#64748b" }} onClick={() => setVistaMovil(false)} title="Escritorio">🖥️</button>
            <button style={{ ...s.vistaBtn, backgroundColor: vistaMovil ? "#0B1628" : "transparent", color: vistaMovil ? "white" : "#64748b" }} onClick={() => setVistaMovil(true)} title="Móvil">📱</button>
          </div>
          {linkTienda && <a href={linkTienda} target="_blank" rel="noreferrer" style={s.btnVer}>Ver tienda ↗</a>}
          <button style={{ ...s.btnGuardar, backgroundColor: exito ? "#0F6E56" : "#0B1628", opacity: guardando ? 0.7 : 1 }} onClick={handleGuardar} disabled={guardando}>
            {guardando ? "Guardando..." : exito ? "✓ Guardado" : "Guardar"}
          </button>
        </div>
      </div>

      {error && <div style={s.errorBox}>⚠️ {error}</div>}

      {/* ── BODY ── */}
      <div style={s.body}>

        {/* Panel editor */}
        <div style={s.editor}>
          {SECCIONES.map((sec) => (
            <div key={sec.key} style={s.secWrap}>
              <button
                style={{ ...s.secHeader, backgroundColor: seccionAbierta === sec.key ? "#f0f9ff" : "white", borderLeft: seccionAbierta === sec.key ? "3px solid #0B1628" : "3px solid transparent" }}
                onClick={() => setSeccionAbierta(prev => prev === sec.key ? null : sec.key)}
              >
                <div style={s.secHeaderLeft}>
                  <span style={{ fontSize: 16 }}>{sec.icon}</span>
                  <div>
                    <p style={s.secLabel}>{sec.label}</p>
                    <p style={s.secDesc}>{sec.desc}</p>
                  </div>
                </div>
                <span style={{ ...s.chevron, transform: seccionAbierta === sec.key ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
              </button>

              {seccionAbierta === sec.key && (
                <div style={s.subsecs}>
                  {sec.subsecciones.map((sub) => (
                    <div key={sub.key}>
                      <button
                        style={{ ...s.subBtn, backgroundColor: subseccionActiva === sub.key ? "#e0f2fe" : "#f8fafc", fontWeight: subseccionActiva === sub.key ? "600" : "400", color: subseccionActiva === sub.key ? "#0B1628" : "#64748b" }}
                        onClick={() => setSubseccionActiva(sub.key)}
                      >
                        <span style={{ fontSize: 13 }}>{sub.icon}</span>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 12, color: "inherit" }}>{sub.label}</p>
                          <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>{sub.desc}</p>
                        </div>
                        <span style={{ fontSize: 13, color: "#94a3b8" }}>›</span>
                      </button>

                      {subseccionActiva === sub.key && (
                        <div style={s.subContent}>
                          <SubContenido
                            subKey={sub.key}
                            empresa={empresa}
                            onChange={handleEmpresaChange}
                            bannerPreview={bannerPreview || (empresa.banner_url ? `${BASE_URL}${empresa.banner_url}` : null)}
                            onBannerChange={handleBannerChange}
                            onQuitarBanner={quitarBanner}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Panel preview */}
        <div style={s.preview}>
          <div style={s.browserBar}>
            <div style={{ display: "flex", gap: 4 }}>
              {["#ff5f57", "#febc2e", "#28c840"].map(c => <div key={c} style={{ width: 9, height: 9, borderRadius: "50%", backgroundColor: c }} />)}
            </div>
            <div style={s.browserUrl}>
              <span style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>{linkTienda || "tu-tienda"}</span>
            </div>
            <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13 }} onClick={() => setIframeKey(k => k + 1)} title="Recargar">🔄</button>
          </div>

          <div style={{ ...s.iframeWrap, backgroundColor: vistaMovil ? "#e2e8f0" : "white", padding: vistaMovil ? "16px" : "0", justifyContent: vistaMovil ? "center" : "stretch" }}>
            {linkTienda ? (
              <iframe key={iframeKey} src={linkTienda}
                style={{ ...s.iframe, width: vistaMovil ? "390px" : "100%", borderRadius: vistaMovil ? "20px" : "0", border: vistaMovil ? "8px solid #0B1628" : "none", boxShadow: vistaMovil ? "0 20px 60px rgba(0,0,0,0.3)" : "none" }}
                title="Vista previa"
              />
            ) : (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, textAlign: "center", padding: 40 }}>
                <span style={{ fontSize: 48 }}>🛍️</span>
                <p style={{ fontSize: 14, color: "#64748b" }}>Configura tu tienda para ver la vista previa</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Contenido de subsecciones ────────────────────────────────────────────────
function SubContenido({ subKey, empresa, onChange, bannerPreview, onBannerChange, onQuitarBanner }) {
  const COLORES = ["#0F6E56", "#0099FF", "#7c3aed", "#db2777", "#dc2626", "#d97706", "#0e7490", "#0B1628"];

  if (subKey === "color") return (
    <div style={f.wrap}>
      <p style={f.tip}>💡 Se aplica en botones y precios de tu tienda.</p>
      <div style={f.colorRow}>
        {COLORES.map(c => (
          <button key={c} type="button"
            style={{ ...f.colorDot, backgroundColor: c, outline: empresa?.color_primario === c ? `3px solid #0f172a` : "none", outlineOffset: "2px", transform: empresa?.color_primario === c ? "scale(1.15)" : "scale(1)" }}
            onClick={() => onChange("color_primario", c)}
          />
        ))}
        <input type="color" value={empresa?.color_primario || "#0F6E56"} onChange={e => onChange("color_primario", e.target.value)}
          style={{ width: 22, height: 22, border: "none", cursor: "pointer", borderRadius: "50%", padding: 0 }} title="Color personalizado"
        />
      </div>
      <div style={f.colorValRow}>
        <span style={{ fontSize: 11, fontFamily: "monospace", color: "#64748b" }}>{empresa?.color_primario || "#0F6E56"}</span>
        <div style={{ ...f.colorPreview, backgroundColor: empresa?.color_primario || "#0F6E56" }}>Vista previa</div>
      </div>
    </div>
  );

  if (subKey === "banner") return (
    <div style={f.wrap}>
      <p style={f.tip}>💡 Imagen de fondo de tu portada. Recomendado: 1200x400px.</p>
      {bannerPreview ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <img src={bannerPreview} alt="Banner" style={{ width: "100%", height: 80, objectFit: "cover", borderRadius: 8, border: "1px solid #e2e8f0" }} />
          <button style={{ background: "none", border: "none", color: "#ef4444", fontSize: 12, cursor: "pointer", fontWeight: 600, alignSelf: "flex-start" }} onClick={onQuitarBanner}>✕ Quitar banner</button>
        </div>
      ) : (
        <label style={f.uploadArea}>
          <span style={{ fontSize: 24 }}>🖼️</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>Subir banner</span>
          <span style={{ fontSize: 10, color: "#94a3b8" }}>JPG, PNG o WEBP · Máx 5MB</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => e.target.files[0] && onBannerChange(e.target.files[0])} style={{ display: "none" }} />
        </label>
      )}
    </div>
  );

  if (subKey === "portada") return (
    <div style={f.wrap}>
      <p style={f.tip}>💡 Lo primero que ven tus clientes al entrar.</p>
      <Field label="Título principal" hint="Vacío = nombre de tu empresa">
        <input style={f.input} placeholder={empresa?.nombre} value={empresa?.hero_titulo || ""} onChange={e => onChange("hero_titulo", e.target.value)} />
      </Field>
      <Field label="Frase de bienvenida">
        <input style={f.input} placeholder="Ej: Los mejores productos al mejor precio" value={empresa?.hero_subtitulo || ""} onChange={e => onChange("hero_subtitulo", e.target.value)} />
      </Field>
      <Field label="Texto del botón" hint="Máx. 30 caracteres">
        <input style={f.input} placeholder="Ver catálogo →" value={empresa?.hero_btn_texto || ""} onChange={e => onChange("hero_btn_texto", e.target.value)} maxLength={30} />
      </Field>
    </div>
  );

  if (subKey === "nosotros") return (
    <div style={f.wrap}>
      <p style={f.tip}>💡 Aparece debajo de los productos destacados.</p>
      <Field label="Título de la sección">
        <input style={f.input} placeholder={`Conoce ${empresa?.nombre || "nuestra empresa"}`} value={empresa?.nosotros_titulo || ""} onChange={e => onChange("nosotros_titulo", e.target.value)} />
      </Field>
      <Field label="Descripción">
        <textarea style={f.textarea} placeholder="Somos una empresa dedicada a..." value={empresa?.descripcion || ""} onChange={e => onChange("descripcion", e.target.value)} rows={3} maxLength={500} />
        <span style={{ fontSize: 10, color: "#94a3b8", textAlign: "right" }}>{(empresa?.descripcion || "").length}/500</span>
      </Field>
    </div>
  );

  if (subKey === "horario") return (
    <div style={f.wrap}>
      <p style={f.tip}>💡 Informa a tus clientes cuándo atiendes.</p>
      <Field label="Horario de atención">
        <input style={f.input} placeholder="Ej: Lun-Sáb 7am-6pm · Dom 8am-2pm" value={empresa?.horario || ""} onChange={e => onChange("horario", e.target.value)} />
      </Field>
    </div>
  );

  if (subKey === "redes") return (
    <div style={f.wrap}>
      <p style={f.tip}>💡 Aparecen como botones en tu tienda.</p>
      {[
        { key: "whatsapp",  label: "📱 WhatsApp",  prefix: "wa.me/",          placeholder: "573001234567" },
        { key: "instagram", label: "📸 Instagram", prefix: "instagram.com/",  placeholder: "@tunegocio" },
        { key: "facebook",  label: "👍 Facebook",  prefix: "facebook.com/",   placeholder: "tunegocio" },
      ].map(red => (
        <Field key={red.key} label={red.label}>
          <div style={f.prefixRow}>
            <span style={f.prefix}>{red.prefix}</span>
            <input style={f.prefixInput} placeholder={red.placeholder} value={empresa?.[red.key] || ""} onChange={e => onChange(red.key, e.target.value)} />
          </div>
        </Field>
      ))}
    </div>
  );

  if (subKey === "info") return (
    <div style={f.wrap}>
      <p style={f.tip}>💡 Aparece en la página de Contacto.</p>
      <Field label="📞 Teléfono">
        <input style={f.input} placeholder="300 000 0000" value={empresa?.telefono || ""} onChange={e => onChange("telefono", e.target.value)} />
      </Field>
      <Field label="✉️ Email">
        <input style={f.input} placeholder="contacto@tuempresa.com" value={empresa?.email || ""} onChange={e => onChange("email", e.target.value)} />
      </Field>
      <Field label="📍 Dirección">
        <input style={f.input} placeholder="Calle 123 #45-67" value={empresa?.direccion || ""} onChange={e => onChange("direccion", e.target.value)} />
      </Field>
    </div>
  );

  return null;
}

function Field({ label, hint, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: "#374151" }}>{label}</label>
      {children}
      {hint && <p style={{ fontSize: 10, color: "#94a3b8" }}>{hint}</p>}
    </div>
  );
}

// ── Estilos ──────────────────────────────────────────────────────────────────
const s = {
  studio: { display: "flex", flexDirection: "column", height: "calc(100vh - 108px)", fontFamily: "'Inter','Segoe UI',sans-serif", overflow: "hidden" },
  topbar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px", borderBottom: "1px solid #e2e8f0", backgroundColor: "white", gap: 12, flexShrink: 0 },
  topbarLeft: { display: "flex", alignItems: "center", gap: 14 },
  studioLabel: { fontSize: 14, fontWeight: 700, color: "#0f172a" },
  completitudWrap: { display: "flex", alignItems: "center", gap: 7 },
  completitudBar: { width: 70, height: 4, backgroundColor: "#e2e8f0", borderRadius: 999, overflow: "hidden" },
  completitudFill: { height: "100%", borderRadius: 999, transition: "width 0.3s" },
  completitudPct: { fontSize: 11, fontWeight: 600, color: "#64748b" },
  topbarRight: { display: "flex", alignItems: "center", gap: 8 },
  vistaToggle: { display: "flex", backgroundColor: "#f1f5f9", borderRadius: 7, padding: 2, gap: 2 },
  vistaBtn: { padding: "3px 9px", border: "none", borderRadius: 5, fontSize: 12, cursor: "pointer", transition: "all 0.15s" },
  btnVer: { padding: "5px 11px", backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 12, fontWeight: 600, color: "#0F6E56", textDecoration: "none" },
  btnGuardar: { padding: "6px 14px", color: "white", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" },
  errorBox: { margin: "0 14px", padding: "6px 10px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 7, fontSize: 12, color: "#b91c1c", flexShrink: 0 },
  body: { display: "grid", gridTemplateColumns: "260px 1fr", flex: 1, overflow: "hidden" },
  editor: { borderRight: "1px solid #e2e8f0", overflowY: "auto", backgroundColor: "white" },
  secWrap: { borderBottom: "1px solid #f1f5f9" },
  secHeader: { width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", border: "none", cursor: "pointer", textAlign: "left", transition: "all 0.15s" },
  secHeaderLeft: { display: "flex", alignItems: "center", gap: 9 },
  secLabel: { fontSize: 12, fontWeight: 600, color: "#0f172a" },
  secDesc: { fontSize: 10, color: "#94a3b8", marginTop: 1 },
  chevron: { fontSize: 13, color: "#94a3b8", transition: "transform 0.2s", flexShrink: 0 },
  subsecs: { backgroundColor: "#fafafa", borderTop: "1px solid #f1f5f9" },
  subBtn: { width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "8px 12px 8px 22px", border: "none", cursor: "pointer", textAlign: "left", borderBottom: "1px solid #f1f5f9", transition: "all 0.1s" },
  subContent: { padding: "12px 12px 12px 22px", backgroundColor: "white", borderBottom: "1px solid #f1f5f9" },
  preview: { display: "flex", flexDirection: "column", overflow: "hidden", backgroundColor: "#f8fafc" },
  browserBar: { display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", backgroundColor: "#f1f5f9", borderBottom: "1px solid #e2e8f0", flexShrink: 0 },
  browserUrl: { flex: 1, padding: "3px 9px", backgroundColor: "white", borderRadius: 5, border: "1px solid #e2e8f0" },
  iframeWrap: { flex: 1, display: "flex", overflow: "hidden", transition: "all 0.3s" },
  iframe: { height: "100%", border: "none", transition: "all 0.3s" },
  loading: { display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 80 },
};

const f = {
  wrap: { display: "flex", flexDirection: "column", gap: 11 },
  tip: { fontSize: 11, color: "#64748b", padding: "5px 8px", borderRadius: 6, border: "1px solid #e2e8f0", backgroundColor: "#f8fafc", lineHeight: 1.4 },
  input: { width: "100%", padding: "8px 10px", border: "1.5px solid #e2e8f0", borderRadius: 7, fontSize: 12, color: "#0f172a", backgroundColor: "white", outline: "none", boxSizing: "border-box" },
  textarea: { width: "100%", padding: "8px 10px", border: "1.5px solid #e2e8f0", borderRadius: 7, fontSize: 12, color: "#0f172a", backgroundColor: "white", outline: "none", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" },
  colorRow: { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" },
  colorDot: { width: 22, height: 22, borderRadius: "50%", cursor: "pointer", transition: "all 0.15s", border: "none" },
  colorValRow: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  colorPreview: { padding: "4px 10px", color: "white", borderRadius: 5, fontSize: 11, fontWeight: 600 },
  uploadArea: { display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "18px", border: "1.5px dashed #cbd5e1", borderRadius: 9, backgroundColor: "#f8fafc", cursor: "pointer", textAlign: "center" },
  prefixRow: { display: "flex", alignItems: "center", border: "1.5px solid #e2e8f0", borderRadius: 7, overflow: "hidden" },
  prefix: { padding: "8px 9px", backgroundColor: "#f8fafc", borderRight: "1px solid #e2e8f0", fontSize: 10, color: "#94a3b8", whiteSpace: "nowrap", flexShrink: 0 },
  prefixInput: { flex: 1, padding: "8px 9px", border: "none", outline: "none", fontSize: 12, color: "#0f172a", backgroundColor: "transparent" },
};