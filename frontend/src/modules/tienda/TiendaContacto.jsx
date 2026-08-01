import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import TiendaLayout from "./components/TiendaLayout";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function TiendaContacto() {
  const { empresaSlug } = useParams();
  const location        = useLocation();

  useEffect(() => {
    if (empresaSlug) localStorage.setItem("ultima_empresa_slug", empresaSlug);
  }, [empresaSlug]);

  const empresa    = location.state?.empresa
    || JSON.parse(localStorage.getItem("ultima_empresa") || "null");
  const colorMarca      = empresa?.color_primario   || "#0F6E56";
  const colorSecundario = empresa?.color_secundario || "#0B1628";

  // ── Form state
  const [form, setForm]         = useState({ nombre: "", email: "", telefono: "", mensaje: "" });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado]   = useState(false);
  const [error, setError]       = useState("");

  const handleChange = (campo, valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }));
    setError("");
  };

  const handleEnviar = async () => {
    if (!form.nombre.trim() || !form.mensaje.trim()) {
      setError("Por favor completa tu nombre y mensaje.");
      return;
    }

    setEnviando(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/contacto/${empresa?.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();
      setEnviado(true);
      setForm({ nombre: "", email: "", telefono: "", mensaje: "" });
    } catch {
      setError("No se pudo enviar el mensaje. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <TiendaLayout empresa={empresa} carrito={[]} onAbrirCarrito={() => {}}>

      {/* ── HEADER ── */}
      <div style={{ ...s.pageHeader, backgroundColor: colorSecundario, borderBottom: `3px solid ${colorMarca}` }}>
        <div style={s.pageHeaderInner}>
          <h1 style={s.pageTitle}>Contacto</h1>
          <p style={s.pageSubtitle}>Estamos aquí para ayudarte</p>
        </div>
      </div>

      {/* ── CONTENIDO ── */}
      <div style={s.page}>
        <div style={s.grid}>

          {/* ── INFO DE CONTACTO ── */}
          <div style={s.colLeft}>
            <div style={s.card}>
              <h3 style={s.cardTitle}>📍 Información de contacto</h3>
              <div style={s.items}>
                {empresa?.telefono && (
                  <ContactoItem icon="📞" label="Teléfono" valor={empresa.telefono} />
                )}
                {empresa?.email && (
                  <ContactoItem icon="✉️" label="Email" valor={empresa.email} />
                )}
                {empresa?.direccion && (
                  <ContactoItem icon="📍" label="Dirección" valor={empresa.direccion} />
                )}
                {empresa?.horario && (
                  <ContactoItem icon="🕐" label="Horario de atención" valor={empresa.horario} />
                )}
                {empresa?.nit && (
                  <ContactoItem icon="📄" label="NIT" valor={empresa.nit} />
                )}
                {!empresa?.telefono && !empresa?.email && !empresa?.direccion && (
                  <p style={s.sinInfo}>Esta empresa no ha configurado su información de contacto.</p>
                )}
              </div>
            </div>

            {/* Redes sociales */}
            {(empresa?.whatsapp || empresa?.instagram || empresa?.facebook) && (
              <div style={s.card}>
                <h3 style={s.cardTitle}>📱 Redes sociales</h3>
                <div style={s.redesList}>
                  {empresa?.whatsapp && (
                    <a href={`https://wa.me/${empresa.whatsapp}`} target="_blank" rel="noreferrer" style={s.redCard}>
                      <div style={{ ...s.redIconWrap, backgroundColor: "#25D36620" }}>
                        <span style={s.redIcon}>📱</span>
                      </div>
                      <div style={s.redInfo}>
                        <p style={s.redNombre}>WhatsApp</p>
                        <p style={s.redDesc}>Escríbenos directo</p>
                      </div>
                      <div style={{ ...s.redArrow, backgroundColor: "#25D366" }}>→</div>
                    </a>
                  )}
                  {empresa?.instagram && (
                    <a href={`https://instagram.com/${empresa.instagram.replace("@", "")}`} target="_blank" rel="noreferrer" style={s.redCard}>
                      <div style={{ ...s.redIconWrap, backgroundColor: "#E1306C20" }}>
                        <span style={s.redIcon}>📸</span>
                      </div>
                      <div style={s.redInfo}>
                        <p style={s.redNombre}>Instagram</p>
                        <p style={s.redDesc}>@{empresa.instagram.replace("@", "")}</p>
                      </div>
                      <div style={{ ...s.redArrow, backgroundColor: "#E1306C" }}>→</div>
                    </a>
                  )}
                  {empresa?.facebook && (
                    <a href={`https://facebook.com/${empresa.facebook}`} target="_blank" rel="noreferrer" style={s.redCard}>
                      <div style={{ ...s.redIconWrap, backgroundColor: "#1877F220" }}>
                        <span style={s.redIcon}>👍</span>
                      </div>
                      <div style={s.redInfo}>
                        <p style={s.redNombre}>Facebook</p>
                        <p style={s.redDesc}>{empresa.facebook}</p>
                      </div>
                      <div style={{ ...s.redArrow, backgroundColor: "#1877F2" }}>→</div>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── FORMULARIO ── */}
          <div style={s.colRight}>
            <div style={s.card}>
              <h3 style={s.cardTitle}>💬 Envíanos un mensaje</h3>
              <p style={s.cardSubtitle}>Te responderemos lo antes posible</p>

              {enviado ? (
                <div style={s.exitoBox}>
                  <span style={s.exitoIcon}>✅</span>
                  <div>
                    <p style={s.exitoTitle}>¡Mensaje enviado!</p>
                    <p style={s.exitoDesc}>Nos pondremos en contacto contigo pronto.</p>
                  </div>
                  <button
                    style={{ ...s.exitoBtn, backgroundColor: colorMarca }}
                    onClick={() => setEnviado(false)}
                  >
                    Enviar otro
                  </button>
                </div>
              ) : (
                <div style={s.formFields}>
                  {error && <div style={s.errorBox}>⚠️ {error}</div>}

                  <Field label="Nombre *">
                    <input
                      style={s.input}
                      placeholder="Tu nombre completo"
                      value={form.nombre}
                      onChange={e => handleChange("nombre", e.target.value)}
                    />
                  </Field>

                  <div style={s.fieldRow}>
                    <Field label="Email">
                      <input
                        style={s.input}
                        type="email"
                        placeholder="tu@email.com"
                        value={form.email}
                        onChange={e => handleChange("email", e.target.value)}
                      />
                    </Field>
                    <Field label="Teléfono">
                      <input
                        style={s.input}
                        placeholder="300 000 0000"
                        value={form.telefono}
                        onChange={e => handleChange("telefono", e.target.value)}
                      />
                    </Field>
                  </div>

                  <Field label="Mensaje *">
                    <textarea
                      style={s.textarea}
                      placeholder="¿En qué podemos ayudarte?"
                      value={form.mensaje}
                      onChange={e => handleChange("mensaje", e.target.value)}
                      rows={5}
                    />
                  </Field>

                  <button
                    style={{
                      ...s.btnEnviar,
                      backgroundColor: colorMarca,
                      opacity: enviando ? 0.7 : 1,
                    }}
                    onClick={handleEnviar}
                    disabled={enviando}
                  >
                    {enviando ? "Enviando..." : "Enviar mensaje →"}
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ── CTA WhatsApp ── */}
        {empresa?.whatsapp && (
          <div style={{ ...s.ctaWrap, background: `linear-gradient(135deg, ${colorMarca}, ${colorSecundario})` }}>
            <div>
              <p style={s.ctaTitle}>¿Prefieres una respuesta inmediata?</p>
              <p style={s.ctaSubtitle}>Escríbenos por WhatsApp y te atendemos al instante</p>
            </div>
            <a
              href={`https://wa.me/${empresa.whatsapp}`}
              target="_blank" rel="noreferrer"
              style={s.ctaBtn}
            >
              📱 Escribir por WhatsApp
            </a>
          </div>
        )}

      </div>
    </TiendaLayout>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "12px", fontWeight: "700", color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function ContactoItem({ icon, label, valor }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
      <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span style={{ fontSize: "18px" }}>{icon}</span>
      </div>
      <div>
        <p style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "3px" }}>{label}</p>
        <p style={{ fontSize: "15px", color: "#0f172a", fontWeight: "500" }}>{valor}</p>
      </div>
    </div>
  );
}

const s = {
  pageHeader: {
    padding: "48px 24px 32px",
  },
  pageHeaderInner: { maxWidth: "1300px", margin: "0 auto" },
  pageTitle: { fontSize: "36px", fontWeight: "800", color: "white", letterSpacing: "-0.02em", marginBottom: "6px" },
  pageSubtitle: { fontSize: "15px", color: "rgba(255,255,255,0.5)" },
  page: {
    maxWidth: "1300px", margin: "0 auto",
    padding: "40px 24px 60px",
    display: "flex", flexDirection: "column", gap: "24px",
    flex: 1, width: "100%", boxSizing: "border-box",
  },
  grid: {
    display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: "24px",
    alignItems: "start",
  },
  colLeft: { display: "flex", flexDirection: "column", gap: "16px" },
  colRight: {},
  card: {
    backgroundColor: "white", borderRadius: "16px",
    border: "1px solid #e2e8f0", padding: "28px",
  },
  cardTitle: { fontSize: "16px", fontWeight: "700", color: "#0f172a", marginBottom: "6px" },
  cardSubtitle: { fontSize: "13px", color: "#64748b", marginBottom: "20px" },
  items: { display: "flex", flexDirection: "column", gap: "18px" },
  sinInfo: { fontSize: "13px", color: "#94a3b8" },
  redesList: { display: "flex", flexDirection: "column", gap: "10px" },
  redCard: {
    display: "flex", alignItems: "center", gap: "12px",
    padding: "14px", backgroundColor: "#f8fafc",
    borderRadius: "12px", border: "1px solid #e2e8f0",
    textDecoration: "none",
  },
  redIconWrap: { width: "40px", height: "40px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  redIcon: { fontSize: "20px" },
  redInfo: { flex: 1 },
  redNombre: { fontSize: "14px", fontWeight: "600", color: "#0f172a" },
  redDesc: { fontSize: "12px", color: "#64748b" },
  redArrow: { width: "28px", height: "28px", borderRadius: "8px", color: "white", fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  formFields: { display: "flex", flexDirection: "column", gap: "16px" },
  errorBox: {
    padding: "10px 14px", backgroundColor: "#fef2f2",
    border: "1px solid #fecaca", borderRadius: "10px",
    fontSize: "13px", color: "#b91c1c",
  },
  fieldRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" },
  input: {
    width: "100%", padding: "11px 14px",
    border: "1.5px solid #e2e8f0", borderRadius: "10px",
    fontSize: "14px", color: "#0f172a",
    backgroundColor: "white", outline: "none",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%", padding: "11px 14px",
    border: "1.5px solid #e2e8f0", borderRadius: "10px",
    fontSize: "14px", color: "#0f172a",
    backgroundColor: "white", outline: "none",
    boxSizing: "border-box", resize: "vertical",
    fontFamily: "inherit",
  },
  btnEnviar: {
    width: "100%", padding: "13px",
    color: "white", border: "none",
    borderRadius: "10px", fontSize: "15px",
    fontWeight: "700", cursor: "pointer",
    transition: "opacity 0.2s",
  },
  exitoBox: {
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: "12px",
    padding: "32px", textAlign: "center",
    backgroundColor: "#f0fdf4",
    borderRadius: "12px", border: "1px solid #bbf7d0",
  },
  exitoIcon: { fontSize: "40px" },
  exitoTitle: { fontSize: "18px", fontWeight: "700", color: "#0f172a" },
  exitoDesc: { fontSize: "14px", color: "#64748b" },
  exitoBtn: {
    padding: "10px 24px", color: "white",
    border: "none", borderRadius: "10px",
    fontSize: "14px", fontWeight: "600", cursor: "pointer",
    marginTop: "8px",
  },
  ctaWrap: {
    borderRadius: "16px", padding: "28px 32px",
    display: "flex", alignItems: "center",
    justifyContent: "space-between", gap: "20px", flexWrap: "wrap",
  },
  ctaTitle: { fontSize: "18px", fontWeight: "700", color: "white", marginBottom: "6px" },
  ctaSubtitle: { fontSize: "14px", color: "rgba(255,255,255,0.65)" },
  ctaBtn: {
    padding: "13px 24px", backgroundColor: "#25D366",
    color: "white", borderRadius: "12px",
    fontSize: "14px", fontWeight: "700",
    textDecoration: "none", flexShrink: 0, whiteSpace: "nowrap",
  },
};