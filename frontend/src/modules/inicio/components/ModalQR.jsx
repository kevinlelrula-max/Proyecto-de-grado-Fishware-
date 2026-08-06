export default function ModalQR({ url, onClose }) {
  const handleDownload = () => {
    const svg = document.getElementById("qr-tienda");
    if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([data], { type: "image/svg+xml" });
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob),
      download: "qr-tienda.svg",
    });
    a.click();
  };

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.box} onClick={e => e.stopPropagation()}>
        <h3 style={s.title}>QR de tu tienda</h3>
        <p style={s.sub}>Escanea o descarga para compartir</p>
        <div style={s.qrWrap}>
          <div style={s.qrPlaceholder}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            <span style={s.qrLabel}>QR disponible próximamente</span>
          </div>
        </div>
        <p style={s.urlText}>{url}</p>
        <div style={s.btns}>
          <button style={s.btnDownload} onClick={handleDownload}>Descargar SVG</button>
          <button style={s.btnClose} onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

const s = {
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 9000, padding: 20,
  },
  box: {
    background: "white", borderRadius: 18, padding: "28px 24px",
    maxWidth: 320, width: "100%", textAlign: "center",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    display: "flex", flexDirection: "column", gap: 12,
  },
  title:   { fontSize: 18, fontWeight: 800, color: "#0B1628", margin: 0 },
  sub:     { fontSize: 13, color: "#64748b", margin: 0 },
  qrWrap:  { display: "flex", justifyContent: "center", padding: "16px 0" },
  qrPlaceholder: {
    width: 200, height: 200, background: "#f1f5f9", borderRadius: 12,
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", gap: 8, border: "2px dashed #cbd5e1",
  },
  qrLabel: { fontSize: 12, color: "#94a3b8", textAlign: "center", padding: "0 12px" },
  urlText: {
    fontSize: 11, color: "#94a3b8", wordBreak: "break-all", margin: 0,
    background: "#f8fafc", borderRadius: 8, padding: "6px 10px",
  },
  btns:        { display: "flex", gap: 8 },
  btnDownload: {
    flex: 1, padding: "10px", background: "#2563eb", color: "white",
    border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer",
  },
  btnClose: {
    padding: "10px 16px", background: "#f1f5f9", color: "#64748b",
    border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
  },
};
