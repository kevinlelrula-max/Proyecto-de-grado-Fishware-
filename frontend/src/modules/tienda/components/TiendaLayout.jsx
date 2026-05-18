import { useNavigate, useParams, useLocation } from "react-router-dom";

const SLUGS_RESERVADOS = ["mis-pedidos", "perfil", "login", "registro"];

export default function TiendaLayout({ empresa, carrito, onAbrirCarrito, children }) {
  const navigate        = useNavigate();
  const { empresaSlug: slugParam } = useParams();
  const location        = useLocation();

  // Si el slug es una ruta reservada o undefined, usa el último slug guardado
  const empresaSlug =
    !slugParam || SLUGS_RESERVADOS.includes(slugParam)
      ? localStorage.getItem("ultima_empresa_slug") || slugParam
      : slugParam;

  const colorMarca    = empresa?.color_primario || "#0F6E56";
  const empresaNombre = empresa?.nombre || empresaSlug;

  const clienteToken  = localStorage.getItem("cliente_token");
  const clienteNombre = localStorage.getItem("cliente_nombre");
  const estaLogueado  = !!clienteToken;

  const rutaActual = location.pathname;
  const esActiva   = (ruta) => rutaActual === ruta;

  const rutas = [
    { label: "Inicio",   path: `/tienda/${empresaSlug}` },
    { label: "Catálogo", path: `/tienda/${empresaSlug}/catalogo` },
    { label: "Contacto", path: `/tienda/${empresaSlug}/contacto` },
  ];

  const handleCerrarSesion = () => {
    localStorage.removeItem("cliente_token");
    localStorage.removeItem("cliente_id");
    localStorage.removeItem("cliente_nombre");
    localStorage.removeItem("cliente_rol");
    localStorage.removeItem("cliente_empresa_id");
    window.location.reload();
  };

  return (
    <div style={s.wrap}>

      {/* ── NAVBAR ── */}
      <nav style={s.nav}>
        <div style={s.navInner}>

          {/* Marca */}
          <div style={s.navBrand} onClick={() => navigate(`/tienda/${empresaSlug}`)}>
            <div style={{ ...s.navBrandDot, backgroundColor: colorMarca }} />
            <span style={s.navBrandName}>{empresaNombre}</span>
          </div>

          {/* Links */}
          <div style={s.navLinks}>
            {rutas.map((ruta) => (
              <button
                key={ruta.path}
                style={{
                  ...s.navLink,
                  color: esActiva(ruta.path) ? "white" : "rgba(255,255,255,0.55)",
                  borderBottom: esActiva(ruta.path)
                    ? `2px solid ${colorMarca}` : "2px solid transparent",
                }}
                onClick={() => navigate(ruta.path, { state: { empresa } })}
              >
                {ruta.label}
              </button>
            ))}
          </div>

          {/* Acciones */}
          <div style={s.navActions}>
            {estaLogueado ? (
              <>
                <button style={s.navBtnGhost}
                  onClick={() => navigate(`/tienda/${empresaSlug}/pedidos`, { state: { empresa } })}>
                  📦 Pedidos
                </button>
                <button style={s.navBtnGhost}
                  onClick={() => navigate("/tienda/perfil")}>
                  👤 {clienteNombre}
                </button>
                <button style={s.navBtnSalir} onClick={handleCerrarSesion}>
                  Salir
                </button>
              </>
            ) : (
              <>
                <button style={s.navBtnGhost}
                  onClick={() => navigate("/tienda/login", { state: { from: location.pathname } })}>
                  Iniciar sesión
                </button>
                <button
                  style={{ ...s.navBtnPrimary, backgroundColor: colorMarca }}
                  onClick={() => navigate("/tienda/registro")}
                >
                  Registrarse
                </button>
              </>
            )}

            {/* Carrito */}
            <button
              style={{
                ...s.carritoBtn,
                backgroundColor: carrito?.length > 0 ? colorMarca : "rgba(255,255,255,0.1)",
              }}
              onClick={onAbrirCarrito}
            >
              🛒
              {carrito?.length > 0 && (
                <span style={s.carritoBadge}>{carrito.length}</span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ── CONTENIDO ── */}
      {children}

      {/* ── FOOTER ── */}
      <footer style={{ ...s.footer, borderTop: `3px solid ${colorMarca}` }}>
        <div style={s.footerInner}>
          <div style={s.footerBrand}>
            <div style={{ ...s.footerDot, backgroundColor: colorMarca }} />
            <span style={s.footerNombre}>{empresaNombre}</span>
          </div>
          <div style={s.footerLinks}>
            {rutas.map((ruta) => (
              <button
                key={ruta.path}
                style={s.footerLink}
                onClick={() => navigate(ruta.path, { state: { empresa } })}
              >
                {ruta.label}
              </button>
            ))}
          </div>
          <span style={s.footerPowered}>Powered by WareFish</span>
        </div>
      </footer>

    </div>
  );
}

const s = {
  wrap:          { minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "'Inter', 'Segoe UI', sans-serif", display: "flex", flexDirection: "column" },
  nav:           { position: "sticky", top: 0, zIndex: 100, backgroundColor: "rgba(15,23,42,0.97)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.08)" },
  navInner:      { maxWidth: "1300px", margin: "0 auto", padding: "0 24px", height: "64px", display: "flex", alignItems: "center", gap: "16px" },
  navBrand:      { display: "flex", alignItems: "center", gap: "8px", flexShrink: 0, cursor: "pointer" },
  navBrandDot:   { width: "8px", height: "8px", borderRadius: "50%" },
  navBrandName:  { fontSize: "15px", fontWeight: "700", color: "white", letterSpacing: "-0.02em" },
  navLinks:      { display: "flex", alignItems: "center", gap: "4px", marginLeft: "24px" },
  navLink:       { padding: "8px 16px", background: "none", border: "none", fontSize: "14px", cursor: "pointer", fontWeight: "500", transition: "all 0.15s" },
  navActions:    { marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 },
  navBtnGhost:   { padding: "6px 12px", background: "transparent", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", color: "rgba(255,255,255,0.8)", fontSize: "12px", cursor: "pointer", fontWeight: "500" },
  navBtnPrimary: { padding: "6px 14px", border: "none", borderRadius: "8px", color: "white", fontSize: "12px", cursor: "pointer", fontWeight: "600" },
  navBtnSalir:   { background: "none", border: "none", color: "#64748b", fontSize: "12px", cursor: "pointer" },
  carritoBtn:    { position: "relative", width: "38px", height: "38px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.15)", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  carritoBadge:  { position: "absolute", top: "-6px", right: "-6px", width: "18px", height: "18px", borderRadius: "50%", backgroundColor: "#ef4444", color: "white", fontSize: "10px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center" },
  footer:        { backgroundColor: "#0B1628", padding: "24px" },
  footerInner:   { maxWidth: "1300px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" },
  footerBrand:   { display: "flex", alignItems: "center", gap: "8px" },
  footerDot:     { width: "8px", height: "8px", borderRadius: "50%" },
  footerNombre:  { fontSize: "14px", fontWeight: "600", color: "white" },
  footerLinks:   { display: "flex", gap: "4px" },
  footerLink:    { background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: "13px", cursor: "pointer", padding: "4px 10px" },
  footerPowered: { fontSize: "12px", color: "rgba(255,255,255,0.3)" },
  content:       { flex: 1, width: "100%" },
};