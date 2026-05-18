import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTiendaEmpresa } from "./hooks/useTiendaEmpresa";
import TiendaLayout from "./components/TiendaLayout";
import Carrito from "./components/Carrito";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

function calcularPrecioInteligente(producto, descuentoLealtad) {
  const precios = [parseFloat(producto.precio)];
  if (producto.precio_mayoreo && parseFloat(producto.precio_mayoreo) > 0) {
    precios.push(parseFloat(producto.precio_mayoreo));
  }
  if (descuentoLealtad > 0) {
    precios.push(parseFloat(producto.precio) * (1 - descuentoLealtad / 100));
  }
  return Math.min(...precios);
}

export default function TiendaInicio() {
  const navigate        = useNavigate();
  const { empresaSlug } = useParams();

  // 1️⃣ Guardar slug para que TiendaLayout lo tenga aunque esté en /mis-pedidos
  useEffect(() => {
    if (empresaSlug) localStorage.setItem("ultima_empresa_slug", empresaSlug);
  }, [empresaSlug]);

  const {
    empresaData,
    productos,
    carrito, carritoAbierto, setCarritoAbierto,
    agregarAlCarrito, cambiarKilos, quitarDelCarrito,
    vaciarCarrito, totalItems, totalPrecio,
    metodosPago, metodoPagoId, setMetodoPagoId,
    direccion, setDireccion, notas, setNotas,
    loadingPedido, errorPedido, setErrorPedido,
    pedidoExitoso, confirmarPedido, cerrarExito,
  } = useTiendaEmpresa(null, empresaSlug);

  const empresa       = empresaData || JSON.parse(localStorage.getItem("ultima_empresa") || "null");
  const colorMarca    = empresa?.color_primario || "#0F6E56";
  const empresaNombre = empresa?.nombre || empresaSlug;
  const empresaId     = empresa?.id;

  const heroTitulo     = empresa?.hero_titulo    || empresaNombre;
  const heroSubtitulo  = empresa?.hero_subtitulo || empresa?.descripcion || "";
  const heroBtnTexto   = empresa?.hero_btn_texto  || "Ver catálogo →";
  const nosotrosTitulo = empresa?.nosotros_titulo || `Conoce ${empresaNombre}`;

  const [descuento,    setDescuento]    = useState(0);
  const [nivelLealtad, setNivelLealtad] = useState(null);
  const clienteId    = localStorage.getItem("cliente_id");
  const estaLogueado = !!localStorage.getItem("cliente_token");

  useEffect(() => {
    if (!estaLogueado || !clienteId || !empresa?.id) return;
    fetch(`${API_BASE}/api/productos/lealtad/cliente/${clienteId}/empresa/${empresa.id}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) { setDescuento(data.descuento || 0); setNivelLealtad(data.nivel_actual); } })
      .catch(() => {});
  }, [estaLogueado, clienteId, empresa?.id]);

  const productosConPrecio = productos.map((p) => ({
    ...p,
    precio_final:    calcularPrecioInteligente(p, descuento),
    precio_original: parseFloat(p.precio),
    tiene_descuento: calcularPrecioInteligente(p, descuento) < parseFloat(p.precio),
  }));

  // 2️⃣ Navigate a la ruta correcta con slug
  const handlePagoExitoso = () => {
    vaciarCarrito();
    setCarritoAbierto(false);
    navigate(`/tienda/${empresaSlug}/pedidos`);
  };

  return (
    <TiendaLayout
      empresa={empresa}
      carrito={carrito}
      onAbrirCarrito={() => setCarritoAbierto(true)}
    >

      {/* ── BANNER DE LEALTAD ── */}
      {estaLogueado && nivelLealtad && (
        <div style={{ ...s.lealtadBanner, backgroundColor: `${colorMarca}15`, borderBottom: `1px solid ${colorMarca}30` }}>
          <span>🏆</span>
          <p style={s.lealtadText}>
            Nivel <strong>{nivelLealtad.nombre}</strong> — precios con{" "}
            <strong>{nivelLealtad.descuento_porcentaje}% de descuento</strong>
          </p>
        </div>
      )}

      {/* ── HERO ── */}
      <div style={{
        ...s.hero,
        background: empresa?.banner_url
          ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.75)), url(${API_BASE}${empresa.banner_url}) center/cover no-repeat`
          : `linear-gradient(135deg, #0f172a 0%, #0d2b45 70%, #0f1f2e 100%)`,
      }}>
        <div style={s.heroInner}>
          <div style={s.heroLeft}>
            <div style={{ ...s.heroBadge, backgroundColor: `${colorMarca}25`, border: `1px solid ${colorMarca}50` }}>
              <div style={{ ...s.heroBadgeDot, backgroundColor: colorMarca }} />
              <span style={{ ...s.heroBadgeText, color: colorMarca }}>Tienda Online</span>
            </div>
            <h1 style={s.heroTitle}>{heroTitulo}</h1>
            {heroSubtitulo && <p style={s.heroDesc}>{heroSubtitulo}</p>}
            <div style={s.heroMeta}>
              {empresa?.horario  && <span style={s.heroMetaItem}>🕐 {empresa.horario}</span>}
              {empresa?.telefono && <span style={s.heroMetaItem}>📞 {empresa.telefono}</span>}
            </div>
            <div style={s.heroBtns}>
              <button
                style={{ ...s.heroBtnPrimary, backgroundColor: colorMarca }}
                onClick={() => navigate(`/tienda/${empresaSlug}/catalogo`, { state: { empresa } })}
              >
                {heroBtnTexto}
              </button>
              {empresa?.whatsapp ? (
                <a href={`https://wa.me/${empresa.whatsapp}`} target="_blank" rel="noreferrer" style={s.heroBtnWsp}>
                  📱 WhatsApp
                </a>
              ) : (
                <button style={s.heroBtnSecundario}
                  onClick={() => navigate(`/tienda/${empresaSlug}/contacto`, { state: { empresa } })}>
                  Contacto
                </button>
              )}
            </div>
          </div>
          <div style={s.heroStats}>
            <div style={s.heroStatCard}>
              <span style={{ ...s.heroStatNum, color: colorMarca }}>{productos.length}</span>
              <span style={s.heroStatLabel}>Productos</span>
            </div>
            <div style={s.heroStatCard}>
              <span style={{ ...s.heroStatNum, color: "#34d399" }}>✓</span>
              <span style={s.heroStatLabel}>Delivery</span>
            </div>
            <div style={s.heroStatCard}>
              <span style={{ ...s.heroStatNum, color: "#fbbf24" }}>🔒</span>
              <span style={s.heroStatLabel}>Seguro</span>
            </div>
          </div>
        </div>
        <div style={s.heroGlow} />
      </div>

      {/* ── PRODUCTOS DESTACADOS ── */}
      <div style={s.section}>
        <div style={s.sectionInner}>
          <div style={s.sectionHeader}>
            <div>
              <h2 style={s.sectionTitle}>Productos destacados</h2>
              <p style={s.sectionSubtitle}>Los más populares de nuestra tienda</p>
            </div>
            <button
              style={{ ...s.verTodos, color: colorMarca, borderColor: colorMarca }}
              onClick={() => navigate(`/tienda/${empresaSlug}/catalogo`, { state: { empresa } })}
            >
              Ver todos →
            </button>
          </div>
          <div style={s.productosGrid}>
            {productosConPrecio.slice(0, 4).map((producto) => (
              <div key={producto.id} style={s.productoCard}>
                <div style={s.productoImgWrap}>
                  {producto.imagen_url ? (
                    <img src={`${API_BASE}${producto.imagen_url}`} alt={producto.nombre} style={s.img} />
                  ) : (
                    <span style={s.productoEmoji}>📦</span>
                  )}
                  {producto.stock <= 0 && <div style={s.sinStockBadge}>Sin stock</div>}
                  {producto.tiene_descuento && producto.stock > 0 && (
                    <div style={{ ...s.descuentoBadge, backgroundColor: `${colorMarca}20`, color: colorMarca }}>
                      🏆 Precio especial
                    </div>
                  )}
                </div>
                <div style={s.productoInfo}>
                  <p style={s.productoNombre}>{producto.nombre}</p>
                  {producto.descripcion && <p style={s.productoDesc}>{producto.descripcion}</p>}
                  <div style={s.productoPrecioRow}>
                    {producto.tiene_descuento && (
                      <span style={s.precioTachado}>${producto.precio_original.toLocaleString("es-CO")}</span>
                    )}
                    <p style={{ ...s.productoPrecio, color: colorMarca }}>
                      ${(producto.precio_final || producto.precio_original).toLocaleString("es-CO")}
                    </p>
                    <span style={s.productoUnidad}>/ {producto.unidad || "unidad"}</span>
                  </div>
                  <button
                    style={{
                      ...s.productoBtn,
                      backgroundColor: producto.stock <= 0 ? "#e2e8f0" : colorMarca,
                      cursor: producto.stock <= 0 ? "not-allowed" : "pointer",
                    }}
                    onClick={() => producto.stock > 0 && agregarAlCarrito(producto, 1)}
                    disabled={producto.stock <= 0}
                  >
                    {producto.stock <= 0 ? "Sin stock" : "Agregar al carrito"}
                  </button>
                </div>
              </div>
            ))}
          </div>
          {productos.length > 4 && (
            <div style={s.verMasWrap}>
              <button
                style={{ ...s.verMasBtn, backgroundColor: colorMarca }}
                onClick={() => navigate(`/tienda/${empresaSlug}/catalogo`, { state: { empresa } })}
              >
                Ver todos los productos ({productos.length}) →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── SOBRE NOSOTROS ── */}
      {(empresa?.descripcion || empresa?.nosotros_contenido) && (
        <div style={s.sobreNosotros}>
          <div style={s.sectionInner}>
            <div style={s.sobreGrid}>
              <div style={s.sobreLeft}>
                <span style={{ ...s.sobreTag, color: colorMarca }}>Sobre nosotros</span>
                <h2 style={s.sobreTitle}>{nosotrosTitulo}</h2>
                <p style={s.sobreDesc}>{empresa?.nosotros_contenido || empresa?.descripcion}</p>
                {empresa?.horario && (
                  <div style={s.sobreHorario}>
                    <span style={s.sobreHorarioIcon}>🕐</span>
                    <div>
                      <p style={s.sobreHorarioLabel}>Horario de atención</p>
                      <p style={s.sobreHorarioValor}>{empresa.horario}</p>
                    </div>
                  </div>
                )}
                <button
                  style={{ ...s.sobreBtn, borderColor: colorMarca, color: colorMarca }}
                  onClick={() => navigate(`/tienda/${empresaSlug}/contacto`, { state: { empresa } })}
                >
                  Contáctanos →
                </button>
              </div>
              <div style={s.sobreRight}>
                <div style={{ ...s.sobreAvatar, backgroundColor: colorMarca }}>
                  {empresaNombre?.slice(0, 2).toUpperCase()}
                </div>
                <div style={s.sobreInfoCards}>
                  {empresa?.telefono && (
                    <div style={s.sobreInfoCard}>
                      <span>📞</span>
                      <span style={s.sobreInfoCardText}>{empresa.telefono}</span>
                    </div>
                  )}
                  {empresa?.whatsapp && (
                    <a href={`https://wa.me/${empresa.whatsapp}`} target="_blank" rel="noreferrer"
                      style={{ ...s.sobreInfoCard, textDecoration: "none", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                      <span>📱</span>
                      <span style={{ ...s.sobreInfoCardText, color: "#0F6E56" }}>WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CARRITO ── */}
      <Carrito
        carrito={carrito}
        carritoAbierto={carritoAbierto}
        setCarritoAbierto={setCarritoAbierto}
        cambiarKilos={cambiarKilos}
        quitarDelCarrito={quitarDelCarrito}
        vaciarCarrito={vaciarCarrito}
        totalItems={totalItems}
        totalPrecio={totalPrecio}
        metodosPago={metodosPago}
        metodoPagoId={metodoPagoId}
        setMetodoPagoId={setMetodoPagoId}
        direccion={direccion}
        setDireccion={setDireccion}
        notas={notas}
        setNotas={setNotas}
        loadingPedido={loadingPedido}
        errorPedido={errorPedido}
        setErrorPedido={setErrorPedido}
        confirmarPedido={confirmarPedido}
        estaLogueado={estaLogueado}
        empresaId={empresaId}
        empresaNombre={empresaNombre}
        onPagoExitoso={handlePagoExitoso}
      />

      {/* 3️⃣ Modal con navigate correcto */}
      {pedidoExitoso && (
        <div style={s.modalOverlay}>
          <div style={s.modal}>
            <div style={s.modalIcon}>🎉</div>
            <h2 style={s.modalTitle}>¡Pedido enviado!</h2>
            <p style={s.modalDesc}>
              Tu pedido <strong>#{pedidoExitoso.id}</strong> fue recibido por {empresaNombre}.
            </p>
            <p style={s.modalTotal}>
              Total: <strong>${pedidoExitoso.total.toLocaleString("es-CO")}</strong>
            </p>
            <button style={{ ...s.modalBtn, backgroundColor: colorMarca }} onClick={() => {
              cerrarExito();
              navigate(`/tienda/${empresaSlug}/pedidos`);
            }}>
              Ver mis pedidos
            </button>
            <button style={s.modalBtnSecondary}
              onClick={() => { cerrarExito(); navigate(`/tienda/${empresaSlug}`, { state: { empresa } }); }}>
              Seguir comprando
            </button>
          </div>
        </div>
      )}

    </TiendaLayout>
  );
}

const s = {
  lealtadBanner: { display: "flex", alignItems: "center", gap: "10px", padding: "10px 24px" },
  lealtadText: { fontSize: "13px", color: "#92400e" },
  hero: { minHeight: "520px", padding: "0 24px", position: "relative", overflow: "hidden", display: "flex", alignItems: "center" },
  heroInner: { maxWidth: "1300px", margin: "0 auto", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "40px", padding: "80px 0", flexWrap: "wrap" },
  heroLeft: { flex: 1, minWidth: "300px", display: "flex", flexDirection: "column", gap: "18px", position: "relative", zIndex: 1 },
  heroBadge: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "999px", alignSelf: "flex-start" },
  heroBadgeDot: { width: "7px", height: "7px", borderRadius: "50%" },
  heroBadgeText: { fontSize: "12px", fontWeight: "700", letterSpacing: "0.05em" },
  heroTitle: { fontSize: "52px", fontWeight: "800", color: "white", letterSpacing: "-0.03em", lineHeight: 1.05, margin: 0 },
  heroDesc: { fontSize: "16px", color: "rgba(255,255,255,0.7)", lineHeight: "1.7", maxWidth: "500px" },
  heroMeta: { display: "flex", gap: "16px", flexWrap: "wrap" },
  heroMetaItem: { fontSize: "13px", color: "rgba(255,255,255,0.5)" },
  heroBtns: { display: "flex", gap: "12px", flexWrap: "wrap" },
  heroBtnPrimary: { padding: "14px 28px", color: "white", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: "700", cursor: "pointer" },
  heroBtnWsp: { padding: "14px 28px", backgroundColor: "#25D366", color: "white", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: "600", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" },
  heroBtnSecundario: { padding: "14px 28px", backgroundColor: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "12px", fontSize: "15px", fontWeight: "600", cursor: "pointer" },
  heroStats: { display: "flex", flexDirection: "column", gap: "12px", position: "relative", zIndex: 1, flexShrink: 0 },
  heroStatCard: { backgroundColor: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "14px", padding: "16px 24px", display: "flex", alignItems: "center", gap: "12px", minWidth: "160px" },
  heroStatNum: { fontSize: "24px", fontWeight: "800" },
  heroStatLabel: { fontSize: "13px", color: "rgba(255,255,255,0.6)", fontWeight: "500" },
  heroGlow: { position: "absolute", bottom: "-80px", left: "-80px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(15,110,86,0.15) 0%, transparent 70%)", pointerEvents: "none" },
  section: { backgroundColor: "#f8fafc", padding: "56px 24px" },
  sobreNosotros: { backgroundColor: "white", padding: "56px 24px" },
  sectionInner: { maxWidth: "1300px", margin: "0 auto" },
  sectionHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px", gap: "16px", flexWrap: "wrap" },
  sectionTitle: { fontSize: "26px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.02em", marginBottom: "4px" },
  sectionSubtitle: { fontSize: "14px", color: "#64748b" },
  verTodos: { padding: "9px 18px", background: "transparent", border: "1.5px solid", borderRadius: "9px", fontSize: "13px", fontWeight: "600", cursor: "pointer", flexShrink: 0 },
  productosGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "20px" },
  productoCard: { backgroundColor: "white", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", display: "flex", flexDirection: "column" },
  productoImgWrap: { height: "180px", backgroundColor: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" },
  img: { width: "100%", height: "100%", objectFit: "cover" },
  productoEmoji: { fontSize: "56px" },
  sinStockBadge: { position: "absolute", top: "10px", left: "10px", backgroundColor: "#ef4444", color: "white", fontSize: "10px", fontWeight: "700", padding: "3px 8px", borderRadius: "999px" },
  descuentoBadge: { position: "absolute", top: "10px", right: "10px", fontSize: "10px", fontWeight: "700", padding: "3px 8px", borderRadius: "999px" },
  productoInfo: { padding: "16px", display: "flex", flexDirection: "column", gap: "8px", flex: 1 },
  productoNombre: { fontSize: "15px", fontWeight: "700", color: "#0f172a" },
  productoDesc: { fontSize: "12px", color: "#94a3b8", lineHeight: "1.4", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  productoPrecioRow: { display: "flex", alignItems: "baseline", gap: "6px", flexWrap: "wrap" },
  precioTachado: { fontSize: "12px", color: "#94a3b8", textDecoration: "line-through" },
  productoPrecio: { fontSize: "20px", fontWeight: "800" },
  productoUnidad: { fontSize: "12px", color: "#94a3b8" },
  productoBtn: { width: "100%", padding: "10px", color: "white", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: "600", marginTop: "auto" },
  verMasWrap: { textAlign: "center", marginTop: "32px" },
  verMasBtn: { padding: "14px 36px", color: "white", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: "600", cursor: "pointer" },
  sobreGrid: { display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "48px", alignItems: "center" },
  sobreLeft: { display: "flex", flexDirection: "column", gap: "16px" },
  sobreTag: { fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em" },
  sobreTitle: { fontSize: "32px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.02em", lineHeight: 1.2 },
  sobreDesc: { fontSize: "15px", color: "#64748b", lineHeight: "1.8", maxWidth: "500px" },
  sobreHorario: { display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", backgroundColor: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" },
  sobreHorarioIcon: { fontSize: "20px" },
  sobreHorarioLabel: { fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase" },
  sobreHorarioValor: { fontSize: "14px", fontWeight: "600", color: "#0f172a", marginTop: "2px" },
  sobreBtn: { alignSelf: "flex-start", padding: "11px 22px", background: "transparent", border: "1.5px solid", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer" },
  sobreRight: { display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" },
  sobreAvatar: { width: "120px", height: "120px", borderRadius: "28px", color: "white", fontSize: "40px", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center" },
  sobreInfoCards: { display: "flex", flexDirection: "column", gap: "10px", width: "100%" },
  sobreInfoCard: { display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", backgroundColor: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" },
  sobreInfoCardText: { fontSize: "14px", color: "#0f172a", fontWeight: "500" },
  modalOverlay: { position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.7)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" },
  modal: { backgroundColor: "white", borderRadius: "20px", padding: "40px 36px", maxWidth: "400px", width: "90%", textAlign: "center" },
  modalIcon: { fontSize: "52px", marginBottom: "16px" },
  modalTitle: { fontSize: "24px", fontWeight: "800", color: "#0f172a", marginBottom: "12px" },
  modalDesc: { fontSize: "14px", color: "#64748b", lineHeight: "1.6", marginBottom: "12px" },
  modalTotal: { fontSize: "18px", color: "#0F6E56", marginBottom: "24px" },
  modalBtn: { width: "100%", padding: "13px", color: "white", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "700", cursor: "pointer", marginBottom: "10px" },
  modalBtnSecondary: { width: "100%", padding: "11px", background: "transparent", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "14px", cursor: "pointer" },
};