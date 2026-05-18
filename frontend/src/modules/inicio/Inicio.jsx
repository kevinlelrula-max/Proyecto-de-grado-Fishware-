import { useState } from "react";
import { useInicio } from "./hooks/useInicio";
import StatCard from "./components/StatCard";
import OnboardingCard from "./components/OnboardingCard";
import PedidosRecientes from "./components/PedidosRecientes";
import StockBajo from "./components/StockBajo";

export default function Inicio({ onIrA }) {
  const {
    resumen, loading, error,
    saludo, nombreUsuario,
    onboarding, esOnboardingCompleto,
  } = useInicio();

  // Permite al usuario saltar el onboarding cuando al menos un paso está completo
  const [forzarDashboard, setForzarDashboard] = useState(false);

  const mostrarOnboarding = !esOnboardingCompleto && !forzarDashboard;

  const slug       = localStorage.getItem("empresa_slug") || "";
  const linkTienda = slug ? `${window.location.origin}/tienda/${slug}` : null;

  if (loading) {
    return (
      <div style={s.loading}>
        <div style={s.loadingSpinner}>
          <div style={s.spinnerInner} />
        </div>
        <p style={s.loadingText}>Cargando tu panel...</p>
      </div>
    );
  }

  if (error) {
    return <div style={s.errorBox}>⚠️ {error}</div>;
  }

  return (
    <div style={s.page}>

      {/* ── HEADER ── */}
      <div style={s.header}>
        <div>
          <h2 style={s.saludo}>{saludo}, {nombreUsuario} 👋</h2>
          <p style={s.fecha}>
            {new Date().toLocaleDateString("es-CO", {
              weekday: "long", year: "numeric",
              month: "long", day: "numeric",
            })}
          </p>
        </div>
        {linkTienda && (
          <a href={linkTienda} target="_blank" rel="noreferrer" style={s.btnTienda}>
            🛍️ Ver mi tienda →
          </a>
        )}
      </div>

      {/* ── EMPRESA NUEVA → ONBOARDING ── */}
      {mostrarOnboarding ? (
        <OnboardingCard
          onboarding={onboarding}
          onIrA={onIrA}
          onSkip={() => setForzarDashboard(true)}
        />
      ) : (
        <>
          {/* ── STATS ── */}
          <div style={s.statsGrid}>
            <StatCard
              icon="💵"
              label="Ventas hoy"
              valor={`$${Number(resumen?.ventasHoy?.ingresos_hoy || 0).toLocaleString("es-CO")}`}
              descripcion={`${resumen?.ventasHoy?.total_ventas || 0} transacciones`}
              color="#0F6E56"
              bg="#E1F5EE"
            />
            <StatCard
              icon="📦"
              label="Pedidos pendientes"
              valor={resumen?.pedidosPendientes || 0}
              descripcion="Sin atender"
              color="#f59e0b"
              bg="#fffbeb"
              alerta={resumen?.pedidosPendientes > 0}
            />
            <StatCard
              icon="⚠️"
              label="Stock bajo"
              valor={resumen?.stockBajo || 0}
              descripcion="Bajo el mínimo"
              color="#ef4444"
              bg="#fef2f2"
              alerta={resumen?.stockBajo > 0}
            />
            <StatCard
              icon="👥"
              label="Clientes"
              valor={resumen?.totalClientes || 0}
              descripcion="Registrados"
              color="#3b82f6"
              bg="#eff6ff"
            />
          </div>

          {/* ── CONTENIDO PRINCIPAL ── */}
          <div style={s.grid}>
            <PedidosRecientes
              pedidos={resumen?.ultimosPedidos}
              onIrA={onIrA}
            />
            <div style={s.colRight}>
              <StockBajo productos={resumen?.productosStockBajo} />
              <AccesosRapidos onIrA={onIrA} />
            </div>
          </div>

          {/* ── SUGERENCIA REFERIDOS ── */}
          {!onboarding?.tieneReferidos && (resumen?.totalClientes ?? 0) > 0 && (
            <BannerReferidos onIrA={onIrA} totalClientes={resumen.totalClientes} />
          )}

          {/* ── BANNER TIENDA ── */}
          {linkTienda && (
            <div style={s.bannerTienda}>
              <div style={s.bannerLeft}>
                <p style={s.bannerTitle}>Tu tienda online está activa 🎉</p>
                <p style={s.bannerDesc}>Comparte este link con tus clientes para que puedan comprar</p>
                <div style={s.bannerLinkRow}>
                  <span style={s.bannerLink}>{linkTienda}</span>
                  <button
                    style={s.bannerCopy}
                    onClick={() => navigator.clipboard.writeText(linkTienda)}
                  >
                    📋 Copiar
                  </button>
                  <a href={linkTienda} target="_blank" rel="noreferrer" style={s.bannerAbrir}>
                    Abrir →
                  </a>
                </div>
              </div>
              <div style={s.bannerIlust}>🛒</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function BannerReferidos({ onIrA, totalClientes }) {
  return (
    <div style={r.wrap}>
      <div style={r.left}>
        <span style={r.badge}>💡 Oportunidad</span>
        <p style={r.title}>Activa tu programa de referidos</p>
        <p style={r.desc}>
          Ya tienes <strong>{totalClientes}</strong> cliente{totalClientes > 1 ? "s" : ""} registrados.
          Con el sistema de referidos puedes hacer que cada uno traiga nuevos compradores
          y recompensarlos automáticamente.
        </p>
        <div style={r.features}>
          <span style={r.feat}>🎁 Premios personalizados</span>
          <span style={r.feat}>⭐ Integrado con lealtad</span>
          <span style={r.feat}>🔗 Link único por cliente</span>
        </div>
      </div>
      <div style={r.right}>
        <div style={r.ilust}>🤝</div>
        <button style={r.btn} onClick={() => onIrA("referidos")}>
          Configurar ahora →
        </button>
        <p style={r.tiempo}>⏱ Solo 3 minutos</p>
      </div>
    </div>
  );
}

function AccesosRapidos({ onIrA }) {
  const items = [
    { icon: "📦", label: "Productos",   key: "productos" },
    { icon: "🖥️", label: "Punto venta", key: "pos" },
    { icon: "📊", label: "Reportes",    key: "reportes" },
    { icon: "🛍️", label: "Tienda",      key: "tienda" },
  ];

  return (
    <div style={a.wrap}>
      <h3 style={a.title}>Accesos rápidos</h3>
      <div style={a.grid}>
        {items.map((item) => (
          <button key={item.key} style={a.btn} onClick={() => onIrA(item.key)}>
            <span style={a.icon}>{item.icon}</span>
            <span style={a.label}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

const s = {
  page: {
    padding: "28px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "12px",
  },
  saludo: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: "-0.02em",
    marginBottom: "4px",
  },
  fecha: { fontSize: "13px", color: "#94a3b8" },
  btnTienda: {
    padding: "10px 20px",
    backgroundColor: "#0B1628",
    color: "white",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "600",
    textDecoration: "none",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1.5fr 1fr",
    gap: "20px",
    alignItems: "start",
  },
  colRight: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  bannerTienda: {
    background: "linear-gradient(135deg, #0B1628 0%, #0d2b45 100%)",
    borderRadius: "16px",
    padding: "28px 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
  },
  bannerLeft: { flex: 1 },
  bannerTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "white",
    marginBottom: "6px",
  },
  bannerDesc: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.6)",
    marginBottom: "16px",
  },
  bannerLinkRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  bannerLink: {
    fontSize: "13px",
    color: "#00C9A7",
    fontFamily: "monospace",
    backgroundColor: "rgba(0,201,167,0.1)",
    padding: "6px 12px",
    borderRadius: "8px",
  },
  bannerCopy: {
    padding: "7px 14px",
    backgroundColor: "rgba(255,255,255,0.1)",
    color: "white",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },
  bannerAbrir: {
    padding: "7px 14px",
    backgroundColor: "#00C9A7",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
    textDecoration: "none",
  },
  bannerIlust: {
    fontSize: "64px",
    flexShrink: 0,
    lineHeight: 1,
  },
  loading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
    padding: "80px",
  },
  loadingSpinner: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    border: "3px solid #e2e8f0",
    borderTopColor: "#00C9A7",
    animation: "spin 0.8s linear infinite",
  },
  spinnerInner: {},
  loadingText: { fontSize: "14px", color: "#94a3b8" },
  errorBox: {
    margin: "28px",
    padding: "14px 16px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "12px",
    fontSize: "13px",
    color: "#b91c1c",
  },
};

const r = {
  wrap: {
    background:     "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
    border:         "1.5px solid #fcd34d",
    borderRadius:   "16px",
    padding:        "28px 32px",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "space-between",
    gap:            "24px",
    flexWrap:       "wrap",
  },
  left:  { flex: 1, minWidth: "260px" },
  right: {
    display:       "flex",
    flexDirection: "column",
    alignItems:    "center",
    gap:           "10px",
    flexShrink:    0,
  },
  badge: {
    display:         "inline-block",
    fontSize:        "11px",
    fontWeight:      "700",
    color:           "#92400e",
    backgroundColor: "#fde68a",
    padding:         "3px 10px",
    borderRadius:    "99px",
    marginBottom:    "8px",
  },
  title: {
    fontSize:     "17px",
    fontWeight:   "800",
    color:        "#78350f",
    marginBottom: "6px",
    lineHeight:   "1.3",
  },
  desc: {
    fontSize:     "13px",
    color:        "#92400e",
    lineHeight:   "1.6",
    marginBottom: "14px",
  },
  features: {
    display:  "flex",
    flexWrap: "wrap",
    gap:      "8px",
  },
  feat: {
    fontSize:        "12px",
    fontWeight:      "600",
    color:           "#78350f",
    backgroundColor: "rgba(255,255,255,0.6)",
    border:          "1px solid #fcd34d",
    padding:         "4px 10px",
    borderRadius:    "8px",
  },
  ilust: {
    fontSize:   "52px",
    lineHeight: 1,
  },
  btn: {
    padding:         "10px 20px",
    backgroundColor: "#d97706",
    color:           "white",
    border:          "none",
    borderRadius:    "10px",
    fontSize:        "13px",
    fontWeight:      "700",
    cursor:          "pointer",
    whiteSpace:      "nowrap",
  },
  tiempo: {
    fontSize: "11px",
    color:    "#a16207",
  },
};

const a = {
  wrap: {
    backgroundColor: "white",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    padding: "20px",
  },
  title: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: "14px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },
  btn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    padding: "16px 12px",
    backgroundColor: "#f8fafc",
    border: "1.5px solid #e2e8f0",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.15s",
  },
  icon: { fontSize: "24px" },
  label: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#374151",
  },
};