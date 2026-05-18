import { useState } from "react";

export default function PreviewStore({ vista, setVista, slug, onReload, iframeKey }) {
  const linkTienda = slug ? `${window.location.origin}/tienda/${slug}` : null;

  return (
    <div style={s.container}>

      {/* Barra superior tipo browser */}
      <div style={s.browserBar}>
        <div style={s.dots}>
          <div style={{ ...s.dot, background: "#ff5f57" }} />
          <div style={{ ...s.dot, background: "#febc2e" }} />
          <div style={{ ...s.dot, background: "#28c840" }} />
        </div>

        <div style={s.urlBar}>
          <span style={s.urlText}>{linkTienda || "Configura tu slug para ver la tienda"}</span>
        </div>

        <div style={s.barActions}>
          {/* Toggle desktop / mobile */}
          <div style={s.toggle}>
            {[
              { key: "desktop", icon: "🖥️" },
              { key: "mobile",  icon: "📱" },
            ].map(v => (
              <button
                key={v.key}
                onClick={() => setVista(v.key)}
                style={{
                  ...s.toggleBtn,
                  background: vista === v.key ? "#0B1628" : "transparent",
                  color: vista === v.key ? "white" : "#64748b",
                }}
                title={v.key === "desktop" ? "Escritorio" : "Móvil"}
              >
                {v.icon}
              </button>
            ))}
          </div>

          <button onClick={onReload} style={s.reloadBtn} title="Recargar preview">🔄</button>

          {linkTienda && (
            <a href={linkTienda} target="_blank" rel="noreferrer" style={s.verBtn}>
              Ver tienda ↗
            </a>
          )}
        </div>
      </div>

      {/* Iframe */}
      <div style={{
        ...s.iframeWrap,
        background: vista === "mobile" ? "#e2e8f0" : "white",
        padding: vista === "mobile" ? "20px" : "0",
        justifyContent: vista === "mobile" ? "center" : "stretch",
        alignItems: vista === "mobile" ? "flex-start" : "stretch",
      }}>
        {linkTienda ? (
          <iframe
            key={iframeKey}
            src={linkTienda}
            title="Vista previa de la tienda"
            style={{
              ...s.iframe,
              width: vista === "mobile" ? "390px" : "100%",
              borderRadius: vista === "mobile" ? "20px" : "0",
              border: vista === "mobile" ? "8px solid #0B1628" : "none",
              boxShadow: vista === "mobile" ? "0 20px 60px rgba(0,0,0,0.35)" : "none",
            }}
          />
        ) : (
          <div style={s.empty}>
            <span style={{ fontSize: 48 }}>🛍️</span>
            <p style={{ fontSize: 14, color: "#64748b", textAlign: "center" }}>
              Guarda tu configuración para ver la tienda aquí
            </p>
          </div>
        )}
      </div>

    </div>
  );
}

const s = {
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    background: "#f8fafc",
  },
  browserBar: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 14px",
    background: "#f1f5f9",
    borderBottom: "1px solid #e2e8f0",
    flexShrink: 0,
  },
  dots: { display: "flex", gap: 5, flexShrink: 0 },
  dot: { width: 10, height: 10, borderRadius: "50%" },
  urlBar: {
    flex: 1,
    padding: "5px 10px",
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 7,
    overflow: "hidden",
  },
  urlText: {
    fontSize: 12,
    color: "#64748b",
    fontFamily: "monospace",
    whiteSpace: "nowrap",
  },
  barActions: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  toggle: {
    display: "flex",
    background: "#e2e8f0",
    borderRadius: 7,
    padding: 2,
    gap: 2,
  },
  toggleBtn: {
    padding: "4px 10px",
    border: "none",
    borderRadius: 5,
    fontSize: 13,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  reloadBtn: {
    background: "none",
    border: "1px solid #e2e8f0",
    borderRadius: 7,
    padding: "4px 8px",
    fontSize: 14,
    cursor: "pointer",
  },
  verBtn: {
    padding: "5px 12px",
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 7,
    fontSize: 12,
    fontWeight: 600,
    color: "#0F6E56",
    textDecoration: "none",
  },
  iframeWrap: {
    flex: 1,
    display: "flex",
    overflow: "hidden",
    transition: "all 0.3s",
  },
  iframe: {
    height: "100%",
    border: "none",
    transition: "all 0.3s",
  },
  empty: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 40,
  },
};
