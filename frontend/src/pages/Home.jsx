import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import BtnSoporte from "../components/BtnSoporte";

const MOBILE_CSS = `
  @media (max-width: 768px) {
    .mk-nav-inner    { padding: 0 20px !important; }
    .mk-nav-links    { gap: 6px !important; }
    .mk-nav-link     { display: none !important; }
    .mk-nav-divider  { display: none !important; }
    .mk-nav-login    { display: none !important; }

    .mk-hero-section { padding: 72px 20px 48px !important; min-height: auto !important; }
    .mk-hero-inner   { grid-template-columns: 1fr !important; gap: 36px !important; }
    .mk-hero-title   { font-size: 34px !important; }
    .mk-hero-img     { display: none !important; }
    .mk-hero-ctas    { flex-direction: column !important; }
    .mk-hero-ctas button { width: 100% !important; }

    .mk-caps-inner   { grid-template-columns: repeat(2, 1fr) !important; }
    .mk-caps-item    { padding: 12px 14px !important; border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.06) !important; }

    .mk-section      { padding: 56px 20px !important; }
    .mk-store-inner  { grid-template-columns: 1fr !important; gap: 36px !important; }
    .mk-steps        { grid-template-columns: 1fr !important; }
    .mk-ct-btns      { flex-direction: column !important; }
    .mk-ct-btns button { width: 100% !important; }

    .mk-footer-inner { flex-direction: column !important; gap: 8px !important; text-align: center !important; }
  }
`;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: "easeOut" },
});

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true },
  transition: { duration: 0.6, delay },
});

const slideLeft = (delay = 0) => ({
  initial: { opacity: 0, x: -40 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay },
});

const slideRight = (delay = 0) => ({
  initial: { opacity: 0, x: 40 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay },
});

function DashboardMockup() {
  return (
    <div style={{ borderRadius: "16px", overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <img
        src="/screenshot-dashboard.png"
        alt="Panel de gestión Merkai"
        style={{ width: "100%", display: "block" }}
      />
    </div>
  );
}

function StoreMockup() {
  return (
    <div style={{ borderRadius: "16px", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", border: "1px solid #e2e8f0" }}>
      <img
        src="/screenshot-tienda.png"
        alt="Tienda online Merkai"
        style={{ width: "100%", display: "block" }}
      />
    </div>
  );
}

function FeatureIcon({ name }) {
  const paths = {
    store:     <><path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></>,
    package:   <><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></>,
    pos:       <><rect x="2" y="3" width="20" height="13" rx="2" /><path d="M8 21h8M12 17v4" /></>,
    buildings: <><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M8 10h.01M16 10h.01" /></>,
    brain:     <><path d="M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-4.96-.44 2.5 2.5 0 01-2.96-3.08 3 3 0 01-.34-5.58 2.5 2.5 0 013.76-3.4z" /><path d="M14.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 004.96-.44 2.5 2.5 0 002.96-3.08 3 3 0 00.34-5.58 2.5 2.5 0 00-3.76-3.4z" /></>,
    gift:      <><polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><path d="M12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" /></>,
  };
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

export default function Home() {
  const navigate = useNavigate();

  const capabilities = [
    { label: "Tienda online pública", desc: "Incluida sin costo adicional" },
    { label: "Multitienda",          desc: "Una cuenta, varios negocios" },
    { label: "Inventario con IA",    desc: "Alertas y predicción automática" },
    { label: "Sin comisiones",       desc: "$0 por cada transacción" },
  ];

  const features = [
    {
      icon: "store",
      title: "Tienda online pública",
      desc: "Cada empresa obtiene una tienda online con URL propia donde los clientes pueden explorar el catálogo y realizar pedidos directamente.",
      color: "#2563eb", bg: "#eff6ff",
    },
    {
      icon: "package",
      title: "Gestión de inventario",
      desc: "Control de productos y stock en tiempo real. Cada venta actualiza el inventario automáticamente y el sistema genera alertas antes de que algo se agote.",
      color: "#0F6E56", bg: "#E1F5EE",
    },
    {
      icon: "pos",
      title: "Punto de venta (POS)",
      desc: "Registro de ventas presenciales con soporte para múltiples métodos de pago, descuentos y generación de historial de transacciones.",
      color: "#7c3aed", bg: "#f5f3ff",
    },
    {
      icon: "buildings",
      title: "Multitienda",
      desc: "Administra varias empresas desde una sola cuenta y cambia entre ellas sin cerrar sesión. Cada una con su propio entorno aislado.",
      color: "#b45309", bg: "#fffbeb",
    },
    {
      icon: "brain",
      title: "Análisis predictivo con IA",
      desc: "Modelos de predicción de demanda que analizan el historial de ventas y anticipan qué productos necesitarás reponer y cuándo.",
      color: "#0e7490", bg: "#ecfeff",
    },
    {
      icon: "gift",
      title: "Sistema de referidos",
      desc: "Programa integrado de referidos que genera beneficios para los usuarios que invitan nuevas empresas a la plataforma.",
      color: "#be185d", bg: "#fdf2f8",
    },
  ];

  const steps = [
    {
      n: "01",
      title: "Crea tu cuenta",
      desc: "Registra tu empresa en minutos. Sin tarjeta de crédito requerida y sin configuraciones complicadas.",
    },
    {
      n: "02",
      title: "Configura tu negocio",
      desc: "Agrega productos, define precios, sube imágenes y establece los roles de acceso para tu equipo.",
    },
    {
      n: "03",
      title: "Empieza a vender",
      desc: "Tu tienda online queda activa de inmediato. Gestiona pedidos, ventas presenciales e inventario desde el mismo panel.",
    },
  ];

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", color: "#0f172a" }}>
      <style>{MOBILE_CSS}</style>

      {/* ── NAVBAR ── */}
      <nav style={n.nav}>
        <div className="mk-nav-inner" style={n.navInner}>
          <div style={n.brand}>
            <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="9" fill="#2563eb" />
              <path d="M8 18c0-5 4-9 9-9s9 4 9 9-4 9-9 9" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M26 18h6l-3-4 3-4h-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="14" cy="15" r="1.5" fill="white" />
            </svg>
            <span style={n.brandName}>Merkai</span>
          </div>

          <div className="mk-nav-links" style={n.navLinks}>
            <a className="mk-nav-link" href="#features" style={n.navLink}>Características</a>
            <a className="mk-nav-link" href="#tienda" style={n.navLink}>Tienda online</a>
            <a className="mk-nav-link" href="#how" style={n.navLink}>Cómo funciona</a>
            <div className="mk-nav-divider" style={n.divider} />
            <button className="mk-nav-login" onClick={() => navigate("/empresa/login")} style={n.btnOutline}>
              Iniciar sesión
            </button>
            <button onClick={() => navigate("/empresa/registro")} style={n.btnPrimary}>
              Registrarse gratis
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="mk-hero-section" style={h.section}>
        <div style={h.glow1} />
        <div style={h.glow2} />

        <div className="mk-hero-inner" style={h.inner}>
          <motion.div {...fadeUp(0)}>
            <div style={h.badge}>Gestión comercial y ecommerce · Todo en uno</div>
            <h1 className="mk-hero-title" style={h.title}>
              Tu empresa<br />
              y tu tienda online,<br />
              <span style={h.titleAccent}>en un solo lugar.</span>
            </h1>
            <p style={h.subtitle}>
              Merkai es una plataforma para gestionar inventario, ventas y clientes,
              con una tienda online pública incluida desde el primer día, sin costo adicional
              y sin depender de otras herramientas.
            </p>
            <div className="mk-hero-ctas" style={h.ctas}>
              <button onClick={() => navigate("/empresa/registro")} style={h.ctaPrimary}>
                Crear cuenta gratis →
              </button>
              <button onClick={() => navigate("/empresa/login")} style={h.ctaSecondary}>
                Ya tengo cuenta
              </button>
            </div>
            <div style={h.trust}>
              <span style={h.trustDot} />
              <span style={h.trustText}>Sin tarjeta de crédito · Sin comisiones · Configuración en minutos</span>
            </div>
          </motion.div>

          <motion.div className="mk-hero-img" {...fadeUp(0.2)}>
            <DashboardMockup />
          </motion.div>
        </div>
      </section>

      {/* ── CAPABILITIES BAR ── */}
      <section style={st.section}>
        <div className="mk-caps-inner" style={st.inner}>
          {capabilities.map((c, i) => (
            <motion.div
              key={i}
              className="mk-caps-item"
              style={{ ...st.item, ...(i === capabilities.length - 1 ? { borderRight: "none" } : {}) }}
              {...fadeIn(i * 0.1)}
            >
              <div>
                <div style={st.label}>{c.label}</div>
                <div style={st.desc}>{c.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="mk-section" style={f.section}>
        <motion.div style={f.header} {...fadeUp(0)}>
          <div style={f.badge}>Funcionalidades</div>
          <h2 style={f.title}>Una plataforma, todo lo que necesitas</h2>
          <p style={f.subtitle}>
            Inventario, ventas, clientes y tienda online, todo conectado
            y funcionando desde un solo panel.
          </p>
        </motion.div>

        <div style={f.grid}>
          {features.map((feat, i) => (
            <motion.div
              key={i}
              style={f.card}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.1)" }}
            >
              <div style={{ ...f.iconWrap, backgroundColor: feat.bg, color: feat.color }}>
                <FeatureIcon name={feat.icon} />
              </div>
              <h3 style={{ ...f.cardTitle, color: feat.color }}>{feat.title}</h3>
              <p style={f.cardDesc}>{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TIENDA ONLINE ── */}
      <section id="tienda" className="mk-section" style={sy.section}>
        <div className="mk-store-inner" style={sy.inner}>
          <motion.div {...slideLeft(0)}>
            <div style={f.badge}>Ecommerce incluido</div>
            <h2 style={sy.title}>
              Tu tienda pública,<br />lista desde el primer día
            </h2>
            <p style={sy.desc}>
              Al crear tu empresa en Merkai obtienes automáticamente una tienda online
              con URL propia donde los clientes pueden ver el catálogo, agregar
              productos al carrito y hacer pedidos, sin necesidad de configurar nada extra.
            </p>
            <ul style={sy.list}>
              {[
                "URL propia por empresa: merkai.app/tienda/nombre-de-tu-empresa",
                "Carrito de compras, métodos de pago y seguimiento de pedidos",
                "Notificaciones por correo al comprador y al administrador",
                "Cupones de descuento y sistema de referidos integrado",
              ].map((item, i) => (
                <li key={i} style={sy.listItem}>
                  <span style={sy.check}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <button onClick={() => navigate("/empresa/registro")} style={sy.cta}>
              Crear cuenta gratis →
            </button>
          </motion.div>

          <motion.div {...slideRight(0.1)}>
            <StoreMockup />
          </motion.div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section id="how" className="mk-section" style={hw.section}>
        <motion.div style={f.header} {...fadeUp(0)}>
          <div style={f.badge}>Proceso</div>
          <h2 style={f.title}>Listo en tres pasos</h2>
          <p style={f.subtitle}>
            Desde el registro hasta la primera venta, el proceso es directo y sin configuraciones complicadas.
          </p>
        </motion.div>

        <div className="mk-steps" style={hw.steps}>
          {steps.map((step, i) => (
            <motion.div
              key={i}
              style={hw.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <div style={hw.stepNum}>{step.n}</div>
              <h3 style={hw.stepTitle}>{step.title}</h3>
              <p style={hw.stepDesc}>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={ct.section}>
        <motion.div style={ct.inner} {...fadeUp(0)}>
          <h2 style={ct.title}>¿Listo para empezar?</h2>
          <p style={ct.subtitle}>
            Crea tu cuenta, configura tu empresa y empieza a gestionar
            tus ventas e inventario desde el mismo día. Sin costos ocultos ni comisiones.
          </p>
          <div className="mk-ct-btns" style={ct.btns}>
            <button onClick={() => navigate("/empresa/registro")} style={ct.btnPrimary}>
              Crear cuenta gratis
            </button>
            <button onClick={() => navigate("/empresa/login")} style={ct.btnOutline}>
              Ya tengo cuenta
            </button>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={fo.footer}>
        <div className="mk-footer-inner" style={fo.inner}>
          <div style={fo.brand}>
            <svg width="22" height="22" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="9" fill="#2563eb" />
              <path d="M8 18c0-5 4-9 9-9s9 4 9 9-4 9-9 9" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M26 18h6l-3-4 3-4h-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="14" cy="15" r="1.5" fill="white" />
            </svg>
            <span style={fo.brandName}>Merkai</span>
          </div>
          <span style={fo.copy}>© 2026 Merkai · Plataforma de gestión comercial y ecommerce</span>
        </div>
      </footer>

      <BtnSoporte />
    </div>
  );
}

/* ─── ESTILOS ─── */

const n = {
  nav: {
    position: "sticky", top: 0, zIndex: 100,
    backgroundColor: "rgba(15,23,42,0.95)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  navInner: {
    maxWidth: "1200px", margin: "0 auto",
    padding: "0 32px", height: "64px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  brand: { display: "flex", alignItems: "center", gap: "10px" },
  brandName: { fontSize: "20px", fontWeight: "700", color: "white", letterSpacing: "-0.02em" },
  navLinks: { display: "flex", alignItems: "center", gap: "8px" },
  navLink: {
    color: "rgba(255,255,255,0.65)", fontSize: "14px",
    textDecoration: "none", padding: "6px 14px",
    borderRadius: "8px", transition: "color 0.2s",
  },
  divider: { width: "1px", height: "20px", backgroundColor: "rgba(255,255,255,0.15)", margin: "0 4px" },
  btnOutline: {
    padding: "8px 18px", background: "transparent",
    border: "1px solid rgba(255,255,255,0.3)", borderRadius: "8px",
    color: "white", fontSize: "14px", cursor: "pointer", fontWeight: "500",
  },
  btnPrimary: {
    padding: "8px 20px", backgroundColor: "#2563eb",
    border: "none", borderRadius: "8px",
    color: "white", fontSize: "14px", cursor: "pointer", fontWeight: "600",
  },
};

const h = {
  section: {
    minHeight: "100vh",
    background: "linear-gradient(145deg, #0f172a 0%, #0d2b45 50%, #0f1f2e 100%)",
    display: "flex", alignItems: "center",
    padding: "80px 32px",
    position: "relative", overflow: "hidden",
  },
  glow1: {
    position: "absolute", top: "-200px", left: "-200px",
    width: "600px", height: "600px", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  glow2: {
    position: "absolute", bottom: "-200px", right: "-100px",
    width: "500px", height: "500px", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(96,165,250,0.12) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  inner: {
    maxWidth: "1200px", margin: "0 auto", width: "100%",
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: "64px", alignItems: "center",
    position: "relative", zIndex: 1,
  },
  badge: {
    display: "inline-flex", alignItems: "center",
    padding: "5px 14px", borderRadius: "999px",
    border: "1px solid rgba(37,99,235,0.4)",
    color: "#93c5fd", fontSize: "13px", fontWeight: "500",
    marginBottom: "20px", backgroundColor: "rgba(37,99,235,0.08)",
  },
  title: {
    fontSize: "52px", fontWeight: "800", color: "white",
    lineHeight: "1.1", letterSpacing: "-0.03em", marginBottom: "20px",
  },
  titleAccent: { color: "#60a5fa" },
  subtitle: {
    fontSize: "17px", color: "rgba(255,255,255,0.65)",
    lineHeight: "1.7", marginBottom: "32px", maxWidth: "440px",
  },
  ctas: { display: "flex", gap: "12px", marginBottom: "20px" },
  ctaPrimary: {
    padding: "13px 28px", backgroundColor: "#2563eb",
    color: "white", border: "none", borderRadius: "10px",
    fontSize: "15px", fontWeight: "700", cursor: "pointer",
  },
  ctaSecondary: {
    padding: "13px 28px", background: "transparent",
    color: "white", border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: "10px", fontSize: "15px", cursor: "pointer",
  },
  trust: { display: "flex", alignItems: "center", gap: "8px" },
  trustDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#60a5fa", display: "inline-block" },
  trustText: { fontSize: "13px", color: "rgba(255,255,255,0.45)" },
};

const st = {
  section: {
    backgroundColor: "#0f172a",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    padding: "28px 32px",
  },
  inner: {
    maxWidth: "960px", margin: "0 auto",
    display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0,
  },
  item: {
    display: "flex", alignItems: "center", gap: "14px",
    padding: "14px 24px",
    borderRight: "1px solid rgba(255,255,255,0.06)",
  },
  label: { fontSize: "14px", fontWeight: "700", color: "white", lineHeight: "1.3" },
  desc:  { fontSize: "12px", color: "rgba(255,255,255,0.45)", marginTop: "2px" },
};

const f = {
  section: { padding: "96px 32px", backgroundColor: "#f8fafc" },
  header:  { textAlign: "center", marginBottom: "56px" },
  badge: {
    display: "inline-block", padding: "4px 14px",
    borderRadius: "999px", border: "1px solid #e2e8f0",
    color: "#64748b", fontSize: "12px", fontWeight: "600",
    marginBottom: "14px", backgroundColor: "white",
    letterSpacing: "0.04em", textTransform: "uppercase",
  },
  title:    { fontSize: "36px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.02em", marginBottom: "12px" },
  subtitle: { fontSize: "16px", color: "#64748b", maxWidth: "520px", margin: "0 auto" },
  grid: {
    maxWidth: "1100px", margin: "0 auto",
    display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px",
  },
  card: {
    backgroundColor: "white", borderRadius: "16px",
    padding: "28px 24px", border: "1px solid #e2e8f0",
    cursor: "default", transition: "all 0.2s",
  },
  iconWrap: {
    width: "48px", height: "48px", borderRadius: "12px",
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: "16px",
  },
  cardTitle: { fontSize: "16px", fontWeight: "700", marginBottom: "8px" },
  cardDesc:  { fontSize: "14px", color: "#64748b", lineHeight: "1.6" },
};

const sy = {
  section: { padding: "96px 32px", backgroundColor: "white" },
  inner: {
    maxWidth: "1100px", margin: "0 auto",
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: "80px", alignItems: "center",
  },
  title: {
    fontSize: "34px", fontWeight: "800", color: "#0f172a",
    lineHeight: "1.25", letterSpacing: "-0.02em",
    marginTop: "12px", marginBottom: "16px",
  },
  desc: { fontSize: "15px", color: "#64748b", lineHeight: "1.75", marginBottom: "24px" },
  list: { listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: "10px" },
  listItem: { display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "14px", color: "#374151" },
  check: {
    width: "20px", height: "20px", borderRadius: "50%",
    backgroundColor: "#dbeafe", color: "#2563eb",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "11px", fontWeight: "700", flexShrink: 0, marginTop: "1px",
  },
  cta: {
    padding: "12px 28px", backgroundColor: "#2563eb",
    color: "white", border: "none", borderRadius: "10px",
    fontSize: "15px", fontWeight: "700", cursor: "pointer",
  },
};

const hw = {
  section: { padding: "96px 32px", backgroundColor: "#f8fafc" },
  steps: {
    maxWidth: "900px", margin: "0 auto",
    display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "32px",
  },
  step:      { backgroundColor: "white", borderRadius: "16px", padding: "32px 28px", border: "1px solid #e2e8f0" },
  stepNum:   { fontSize: "36px", fontWeight: "900", color: "#eff6ff", WebkitTextStroke: "2px #2563eb", marginBottom: "16px", lineHeight: 1 },
  stepTitle: { fontSize: "18px", fontWeight: "700", color: "#0f172a", marginBottom: "8px" },
  stepDesc:  { fontSize: "14px", color: "#64748b", lineHeight: "1.6" },
};

const ct = {
  section: { background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)", padding: "96px 32px" },
  inner:   { textAlign: "center", maxWidth: "600px", margin: "0 auto" },
  title:   { fontSize: "40px", fontWeight: "800", color: "white", marginBottom: "16px", letterSpacing: "-0.02em", lineHeight: "1.2" },
  subtitle:{ fontSize: "16px", color: "rgba(255,255,255,0.72)", marginBottom: "36px", lineHeight: "1.6" },
  btns:    { display: "flex", gap: "12px", justifyContent: "center" },
  btnPrimary: {
    padding: "14px 32px", backgroundColor: "white",
    color: "#1d4ed8", border: "none", borderRadius: "10px",
    fontSize: "15px", fontWeight: "700", cursor: "pointer",
  },
  btnOutline: {
    padding: "14px 32px", background: "transparent",
    color: "white", border: "1px solid rgba(255,255,255,0.4)",
    borderRadius: "10px", fontSize: "15px", cursor: "pointer",
  },
};

const fo = {
  footer: { backgroundColor: "#0f172a", borderTop: "1px solid rgba(255,255,255,0.08)", padding: "24px 32px" },
  inner:  { maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" },
  brand:     { display: "flex", alignItems: "center", gap: "8px" },
  brandName: { fontSize: "15px", fontWeight: "700", color: "white" },
  copy:      { fontSize: "13px", color: "rgba(255,255,255,0.4)" },
};
