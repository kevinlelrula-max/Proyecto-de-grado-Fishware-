import { useNavigate, Navigate } from "react-router-dom";
import { useMisPedidos, ESTADOS } from "../modules/tienda/hooks/useMisPedidos";
import PedidoCard from "../modules/tienda/components/PedidoCard";

export default function MisPedidos() {
  const navigate = useNavigate();
  const { pedidos, loading, error, estaLogueado, clienteNombre, refetch, notifPermiso, pedirPermiso } = useMisPedidos();

  if (!estaLogueado) {
    return <Navigate to="/tienda/login" state={{ from: "/tienda/mis-pedidos" }} replace />;
  }

  // Agrupar pedidos por estado activo vs finalizado
  const pedidosActivos    = pedidos.filter((p) => !["entregado", "cancelado"].includes(p.estado));
  const pedidosFinalizados = pedidos.filter((p) => ["entregado", "cancelado"].includes(p.estado));

  return (
    <div style={s.page}>

      {/* ── NAVBAR ── */}
      <nav style={s.nav}>
        <div style={s.navInner}>
          <div style={s.navBrand} onClick={() => navigate("/tienda")}>
            <svg width="24" height="24" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="9" fill="#0F6E56"/>
              <path d="M8 18c0-5 4-9 9-9s9 4 9 9-4 9-9 9" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
              <path d="M26 18h6l-3-4 3-4h-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="14" cy="15" r="1.5" fill="white"/>
            </svg>
            <div>
              <span style={s.navBrandName}>Merkai</span>
              <span style={s.navBrandSub}>Tienda</span>
            </div>
          </div>

          <div style={s.navActions}>
            
            <div style={s.navUser}>
              <div style={s.navAvatar}>{clienteNombre?.[0]?.toUpperCase() ?? "C"}</div>
              <span style={s.navUserName}>{clienteNombre}</span>
            </div>
            <button style={s.navBtnSalir} onClick={() => {
              localStorage.removeItem("cliente_token");
              localStorage.removeItem("cliente_id");
              localStorage.removeItem("cliente_nombre");
              navigate("/tienda");
            }}>
              Salir
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={s.hero}>
        <div style={s.heroInner}>
          <div>
            <h1 style={s.heroTitle}>📦 Mis pedidos</h1>
            <p style={s.heroSub}>
              Seguimiento en tiempo real de tus compras
            </p>
          </div>
          <button style={s.refetchBtn} onClick={refetch}>
            🔄 Actualizar
          </button>
        </div>
        {notifPermiso !== "granted" && (
          <div style={s.notifBanner}>
            <span style={s.notifText}>
              🔔 Activa las notificaciones para saber cuándo cambia el estado de tu pedido
            </span>
            <button
              onClick={pedirPermiso}
              style={{ ...s.notifBtn, ...(notifPermiso === "denied" ? s.notifBtnBloq : {}) }}
              disabled={notifPermiso === "denied"}
            >
              {notifPermiso === "denied" ? "Bloqueadas en el navegador" : "Activar"}
            </button>
          </div>
        )}
        <div style={s.heroGlow} />
      </div>

      {/* ── CONTENIDO ── */}
      <div style={s.content}>

        {/* Error */}
        {error && (
          <div style={s.errorBox}>⚠️ {error}</div>
        )}

        {/* Loading */}
        {loading ? (
          <div style={s.skeletonWrap}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={s.skeleton} />
            ))}
          </div>
        ) : pedidos.length === 0 ? (
          /* Empty state */
          <div style={s.empty}>
            <span style={s.emptyIcon}>📦</span>
            <p style={s.emptyTitle}>Aún no tienes pedidos</p>
            <p style={s.emptyDesc}>Visita el marketplace y haz tu primer pedido</p>
            <button style={s.emptyBtn} onClick={() => navigate("/tienda")}>
              Ir al marketplace →
            </button>
          </div>
        ) : (
          <>
            {/* Pedidos activos */}
            {pedidosActivos.length > 0 && (
              <div style={s.section}>
                <div style={s.sectionHeader}>
                  <h2 style={s.sectionTitle}>En curso</h2>
                  <span style={s.sectionCount}>{pedidosActivos.length}</span>
                  <span style={s.pollBadge}>🔄 Actualización automática cada 30 seg</span>
                </div>
                <div style={s.grid}>
                  {pedidosActivos.map((pedido) => (
                    <PedidoCard key={pedido.id} pedido={pedido} />
                  ))}
                </div>
              </div>
            )}

            {/* Pedidos finalizados */}
            {pedidosFinalizados.length > 0 && (
              <div style={s.section}>
                <div style={s.sectionHeader}>
                  <h2 style={s.sectionTitle}>Historial</h2>
                  <span style={s.sectionCount}>{pedidosFinalizados.length}</span>
                </div>
                <div style={s.grid}>
                  {pedidosFinalizados.map((pedido) => (
                    <PedidoCard key={pedido.id} pedido={pedido} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── FOOTER ── */}
      <footer style={s.footer}>
        <span style={s.footerText}>© 2026 Merkai · Marketplace</span>
        <button style={s.footerBack} onClick={() => navigate("/tienda")}>
          ← Volver al marketplace
        </button>
      </footer>

    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    display: "flex", flexDirection: "column",
  },

  // Navbar
  nav: {
    position: "sticky", top: 0, zIndex: 100,
    backgroundColor: "rgba(15,23,42,0.97)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  navInner: {
    maxWidth: "1100px", margin: "0 auto",
    padding: "0 24px", height: "60px",
    display: "flex", alignItems: "center",
    justifyContent: "space-between",
  },
  navBrand: {
    display: "flex", alignItems: "center", gap: "10px", cursor: "pointer",
  },
  navBrandName: { fontSize: "16px", fontWeight: "700", color: "white", display: "block", lineHeight: 1.1 },
  navBrandSub: { fontSize: "10px", color: "#34d399", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", display: "block" },
  navActions: { display: "flex", alignItems: "center", gap: "10px" },
  navBtnGhost: {
    padding: "6px 14px", background: "transparent",
    border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px",
    color: "rgba(255,255,255,0.8)", fontSize: "13px", cursor: "pointer",
  },
  navUser: { display: "flex", alignItems: "center", gap: "8px" },
  navAvatar: {
    width: "30px", height: "30px", borderRadius: "50%",
    backgroundColor: "#0F6E56", color: "white",
    fontSize: "12px", fontWeight: "700",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  navUserName: { fontSize: "13px", color: "rgba(255,255,255,0.8)", fontWeight: "500" },
  navBtnSalir: { background: "none", border: "none", color: "#64748b", fontSize: "12px", cursor: "pointer" },

  // Hero
  hero: {
    background: "linear-gradient(145deg, #0f172a 0%, #0d2b45 60%, #0f1f2e 100%)",
    padding: "32px 24px", position: "relative", overflow: "hidden",
  },
  heroInner: {
    maxWidth: "1100px", margin: "0 auto",
    display: "flex", justifyContent: "space-between", alignItems: "center",
    position: "relative", zIndex: 1,
  },
  heroTitle: { fontSize: "28px", fontWeight: "800", color: "white", margin: 0, letterSpacing: "-0.02em" },
  heroSub: { fontSize: "14px", color: "rgba(255,255,255,0.55)", marginTop: "6px" },
  heroGlow: {
    position: "absolute", top: "-80px", right: "-80px",
    width: "300px", height: "300px", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(15,110,86,0.2) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  refetchBtn: {
    padding: "9px 18px", backgroundColor: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.2)", borderRadius: "10px",
    color: "white", fontSize: "13px", cursor: "pointer", fontWeight: "500",
    flexShrink: 0,
  },

  // Contenido
  content: {
    flex: 1, maxWidth: "1100px", margin: "0 auto",
    padding: "32px 24px", width: "100%", boxSizing: "border-box",
  },

  // Secciones
  section: { marginBottom: "40px" },
  sectionHeader: {
    display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px",
  },
  sectionTitle: { fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: 0 },
  sectionCount: {
    backgroundColor: "#e2e8f0", color: "#64748b",
    fontSize: "12px", fontWeight: "700",
    padding: "2px 8px", borderRadius: "999px",
  },
  pollBadge: {
    fontSize: "11px", color: "#0F6E56",
    backgroundColor: "#E1F5EE", padding: "3px 10px",
    borderRadius: "999px", fontWeight: "500",
  },

  // Grid
  grid: { display: "flex", flexDirection: "column", gap: "16px" },

  // Skeleton
  skeletonWrap: { display: "flex", flexDirection: "column", gap: "16px" },
  skeleton: {
    height: "220px", borderRadius: "16px",
    backgroundColor: "#e2e8f0",
  },

  // Empty
  empty: {
    textAlign: "center", padding: "80px 24px",
    display: "flex", flexDirection: "column", alignItems: "center", gap: "12px",
  },
  emptyIcon: { fontSize: "52px" },
  emptyTitle: { fontSize: "18px", fontWeight: "700", color: "#0f172a" },
  emptyDesc: { fontSize: "14px", color: "#64748b" },
  emptyBtn: {
    marginTop: "8px", padding: "11px 24px",
    backgroundColor: "#0F6E56", color: "white",
    border: "none", borderRadius: "10px",
    fontSize: "14px", fontWeight: "600", cursor: "pointer",
  },

  // Error
  errorBox: {
    backgroundColor: "#fef2f2", border: "1px solid #fecaca",
    borderRadius: "10px", padding: "12px 16px",
    fontSize: "13px", color: "#b91c1c", marginBottom: "20px",
  },

  // Footer
  footer: {
    borderTop: "1px solid #e2e8f0", backgroundColor: "white",
    padding: "14px 24px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  footerText: { fontSize: "12px", color: "#94a3b8" },
  footerBack: {
    background: "none", border: "none",
    color: "#0F6E56", fontSize: "12px", fontWeight: "600", cursor: "pointer",
  },
  notifBanner: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "10px 16px", backgroundColor: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "10px", marginTop: "14px", position: "relative", zIndex: 1 },
  notifText:   { fontSize: "13px", color: "rgba(255,255,255,0.85)", flex: 1 },
  notifBtn:    { flexShrink: 0, padding: "6px 14px", backgroundColor: "#f59e0b", color: "white", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: "600", cursor: "pointer" },
  notifBtnBloq: { backgroundColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.4)", cursor: "not-allowed" },
};