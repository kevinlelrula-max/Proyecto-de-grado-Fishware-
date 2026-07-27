import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function HeroSection({ variante = "oscuro", empresa, empresaNombre, empresaSlug, productosCount }) {
  const navigate        = useNavigate();
  const colorMarca      = empresa?.color_primario   || "#0F6E56";
  const colorSecundario = empresa?.color_secundario || "#0B1628";
  const heroTitulo      = empresa?.hero_titulo      || empresaNombre;
  const heroSubtitulo   = empresa?.hero_subtitulo   || empresa?.descripcion || "";
  const heroBtnTexto    = empresa?.hero_btn_texto   || "Ver catálogo →";

  if (variante === "lateral") return (
    <HeroLateral
      colorMarca={colorMarca} colorSecundario={colorSecundario}
      heroTitulo={heroTitulo} heroSubtitulo={heroSubtitulo} heroBtnTexto={heroBtnTexto}
      empresa={empresa} empresaNombre={empresaNombre} empresaSlug={empresaSlug}
      productosCount={productosCount} navigate={navigate}
    />
  );

  if (variante === "minimalista") return (
    <HeroMinimalista
      colorMarca={colorMarca} colorSecundario={colorSecundario}
      heroTitulo={heroTitulo} heroSubtitulo={heroSubtitulo} heroBtnTexto={heroBtnTexto}
      empresa={empresa} empresaNombre={empresaNombre} empresaSlug={empresaSlug}
      productosCount={productosCount} navigate={navigate}
    />
  );

  return (
    <HeroOscuro
      colorMarca={colorMarca} colorSecundario={colorSecundario}
      heroTitulo={heroTitulo} heroSubtitulo={heroSubtitulo} heroBtnTexto={heroBtnTexto}
      empresa={empresa} empresaNombre={empresaNombre} empresaSlug={empresaSlug}
      productosCount={productosCount} navigate={navigate}
    />
  );
}

// ── Variante oscuro (diseño original) ────────────────────────────────────────
function HeroOscuro({ colorMarca, colorSecundario, heroTitulo, heroSubtitulo, heroBtnTexto, empresa, empresaNombre, empresaSlug, productosCount, navigate }) {
  return (
    <div style={{
      minHeight: "520px", padding: "0 24px", position: "relative", overflow: "hidden", display: "flex", alignItems: "center",
      background: empresa?.banner_url
        ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.75)), url(${API_BASE}${empresa.banner_url}) center/cover no-repeat`
        : `linear-gradient(135deg, ${colorSecundario} 0%, ${colorSecundario}dd 70%, ${colorSecundario}bb 100%)`,
    }}>
      <div style={{ maxWidth: "1300px", margin: "0 auto", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "40px", padding: "80px 0", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "300px", display: "flex", flexDirection: "column", gap: "18px", position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "999px", alignSelf: "flex-start", backgroundColor: `${colorMarca}25`, border: `1px solid ${colorMarca}50` }}>
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: colorMarca }} />
            <span style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "0.05em", color: colorMarca }}>Tienda Online</span>
          </div>
          <h1 style={{ fontSize: "52px", fontWeight: "800", color: "white", letterSpacing: "-0.03em", lineHeight: 1.05, margin: 0 }}>{heroTitulo}</h1>
          {heroSubtitulo && <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.7)", lineHeight: "1.7", maxWidth: "500px" }}>{heroSubtitulo}</p>}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button style={{ padding: "14px 28px", color: "white", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: "700", cursor: "pointer", backgroundColor: colorMarca }}
              onClick={() => navigate(`/tienda/${empresaSlug}/catalogo`, { state: { empresa } })}>
              {heroBtnTexto}
            </button>
            {empresa?.whatsapp ? (
              <a href={`https://wa.me/${empresa.whatsapp}`} target="_blank" rel="noreferrer"
                style={{ padding: "14px 28px", backgroundColor: "#25D366", color: "white", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: "600", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                📱 WhatsApp
              </a>
            ) : (
              <button style={{ padding: "14px 28px", backgroundColor: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "12px", fontSize: "15px", fontWeight: "600", cursor: "pointer" }}
                onClick={() => navigate(`/tienda/${empresaSlug}/contacto`, { state: { empresa } })}>
                Contacto
              </button>
            )}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", position: "relative", zIndex: 1, flexShrink: 0 }}>
          {[
            { num: productosCount, label: "Productos", color: colorMarca },
            { num: "✓", label: "Delivery",  color: "#34d399" },
            { num: "🔒", label: "Seguro",    color: "#fbbf24" },
          ].map(stat => (
            <div key={stat.label} style={{ backgroundColor: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "14px", padding: "16px 24px", display: "flex", alignItems: "center", gap: "12px", minWidth: "160px" }}>
              <span style={{ fontSize: "24px", fontWeight: "800", color: stat.color }}>{stat.num}</span>
              <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", fontWeight: "500" }}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", bottom: "-80px", left: "-80px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(15,110,86,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
    </div>
  );
}

// ── Variante lateral ──────────────────────────────────────────────────────────
function HeroLateral({ colorMarca, colorSecundario, heroTitulo, heroSubtitulo, heroBtnTexto, empresa, empresaNombre, empresaSlug, productosCount, navigate }) {
  return (
    <div style={{ display: "flex", minHeight: "480px", overflow: "hidden" }}>

      {/* Izquierda: contenido sobre fondo claro */}
      <div style={{ flex: 1, padding: "60px 48px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "20px", backgroundColor: "#f8fafc", minWidth: 0 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 12px", borderRadius: "999px", alignSelf: "flex-start", backgroundColor: `${colorMarca}15`, border: `1px solid ${colorMarca}30` }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: colorMarca }} />
          <span style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.06em", color: colorMarca, textTransform: "uppercase" }}>Tienda Online</span>
        </div>
        <h1 style={{ fontSize: "44px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.03em", lineHeight: 1.1, margin: 0 }}>{heroTitulo}</h1>
        {heroSubtitulo && <p style={{ fontSize: "16px", color: "#64748b", lineHeight: "1.7", maxWidth: "480px", margin: 0 }}>{heroSubtitulo}</p>}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button style={{ padding: "13px 26px", color: "white", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: "700", cursor: "pointer", backgroundColor: colorMarca }}
            onClick={() => navigate(`/tienda/${empresaSlug}/catalogo`, { state: { empresa } })}>
            {heroBtnTexto}
          </button>
          {empresa?.whatsapp ? (
            <a href={`https://wa.me/${empresa.whatsapp}`} target="_blank" rel="noreferrer"
              style={{ padding: "13px 26px", backgroundColor: "#25D366", color: "white", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: "600", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}>
              📱 WhatsApp
            </a>
          ) : (
            <button style={{ padding: "13px 26px", background: "transparent", color: "#64748b", border: "1.5px solid #e2e8f0", borderRadius: "12px", fontSize: "15px", fontWeight: "600", cursor: "pointer" }}
              onClick={() => navigate(`/tienda/${empresaSlug}/contacto`, { state: { empresa } })}>
              Contacto
            </button>
          )}
        </div>
      </div>

      {/* Derecha: panel de color con info de la empresa */}
      <div style={{ width: "340px", flexShrink: 0, backgroundColor: colorSecundario, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "24px", padding: "48px 32px" }}>
        <div style={{ width: "90px", height: "90px", borderRadius: "22px", backgroundColor: colorMarca, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", fontWeight: "800", color: "white" }}>
          {empresaNombre?.slice(0, 2).toUpperCase()}
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "white", fontSize: "18px", fontWeight: "700", margin: 0 }}>{empresaNombre}</p>
        </div>
        <div style={{ display: "flex", gap: "10px", width: "100%" }}>
          {[
            { num: productosCount, label: "Productos" },
            { num: "✓", label: "Delivery" },
          ].map(stat => (
            <div key={stat.label} style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "14px 10px", textAlign: "center" }}>
              <p style={{ fontSize: "20px", fontWeight: "800", color: colorMarca, margin: "0 0 4px" }}>{stat.num}</p>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", margin: 0 }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Variante minimalista ──────────────────────────────────────────────────────
function HeroMinimalista({ colorMarca, colorSecundario, heroTitulo, heroSubtitulo, heroBtnTexto, empresa, empresaNombre, empresaSlug, productosCount, navigate }) {
  return (
    <div style={{ backgroundColor: "white", padding: "80px 24px", borderBottom: `3px solid ${colorMarca}` }}>
      <div style={{ maxWidth: "680px", margin: "0 auto", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 14px", borderRadius: "999px", backgroundColor: `${colorMarca}12`, border: `1px solid ${colorMarca}25` }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: colorMarca }} />
          <span style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.06em", color: colorMarca, textTransform: "uppercase" }}>{empresaNombre}</span>
        </div>
        <h1 style={{ fontSize: "46px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.03em", lineHeight: 1.1, margin: 0 }}>{heroTitulo}</h1>
        {heroSubtitulo && <p style={{ fontSize: "17px", color: "#64748b", lineHeight: "1.7", margin: 0 }}>{heroSubtitulo}</p>}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
          <button style={{ padding: "13px 28px", color: "white", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: "700", cursor: "pointer", backgroundColor: colorMarca }}
            onClick={() => navigate(`/tienda/${empresaSlug}/catalogo`, { state: { empresa } })}>
            {heroBtnTexto}
          </button>
          {empresa?.whatsapp ? (
            <a href={`https://wa.me/${empresa.whatsapp}`} target="_blank" rel="noreferrer"
              style={{ padding: "13px 28px", backgroundColor: "#25D366", color: "white", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: "600", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}>
              📱 WhatsApp
            </a>
          ) : (
            <button style={{ padding: "13px 28px", background: "transparent", color: colorMarca, border: `1.5px solid ${colorMarca}`, borderRadius: "12px", fontSize: "15px", fontWeight: "600", cursor: "pointer" }}
              onClick={() => navigate(`/tienda/${empresaSlug}/contacto`, { state: { empresa } })}>
              Contacto
            </button>
          )}
        </div>
        <div style={{ display: "flex", gap: "28px", marginTop: "12px", paddingTop: "20px", borderTop: "1px solid #f1f5f9", width: "100%", justifyContent: "center" }}>
          {[
            { num: productosCount, label: "productos disponibles" },
            { num: "✓", label: "entrega a domicilio" },
            { num: "🔒", label: "compra segura" },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <p style={{ fontSize: "22px", fontWeight: "800", color: colorMarca, margin: "0 0 2px" }}>{stat.num}</p>
              <p style={{ fontSize: "11px", color: "#94a3b8", margin: 0 }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
