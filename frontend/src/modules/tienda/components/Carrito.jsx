import { useState, useCallback, useEffect, useRef } from "react";
import { useCheckout }  from "../hooks/useCheckout";
import CheckoutModal    from "./CheckoutModal";
import EnvioForm        from "../../envio/components/EnvioForm";
import { validarCupon } from "../../cupones/services/cuponesService";
import { getMiDescuentoActivo } from "../../referidos/services/referidosService";

export default function Carrito({
  carrito,
  carritoAbierto,
  setCarritoAbierto,
  cambiarCantidad,
  quitarDelCarrito,
  vaciarCarrito,
  totalItems,
  totalPrecio,
  metodosPago,
  metodoPagoId,
  setMetodoPagoId,
  direccion,
  setDireccion,
  notas,
  setNotas,
  loadingPedido,
  errorPedido,
  setErrorPedido,
  confirmarPedido,
  estaLogueado,
  empresaId,
  empresaNombre,
  onPedidoCreado,
  onPagoExitoso,
}) {
  const [costoEnvio, setCostoEnvio] = useState(0);
  const handleCostoEnvio = useCallback((costo) => setCostoEnvio(costo), []);

  // Descuento de referido
  const [descuentoReferido, setDescuentoReferido] = useState(null);
  useEffect(() => {
    if (!carritoAbierto || !estaLogueado || !empresaId) return;
    const token = localStorage.getItem("cliente_token");
    if (!token) return;
    getMiDescuentoActivo(token, empresaId).then(setDescuentoReferido).catch(() => {});
  }, [carritoAbierto, estaLogueado, empresaId]);

  const tieneDescuentoRef = descuentoReferido?.tiene_descuento;
  const descuentoRefPct   = tieneDescuentoRef ? (descuentoReferido.descuento_pct || 0) : 0;
  const envioGratisRef    = tieneDescuentoRef && descuentoReferido.envio_gratis;
  const descuentoRefMonto = tieneDescuentoRef ? Math.round(totalPrecio * descuentoRefPct / 100) : 0;
  const costoEnvioEfectivo = envioGratisRef ? 0 : costoEnvio;

  // Cupón
  const [codigoCupon,   setCodigoCupon]   = useState("");
  const [cuponAplicado, setCuponAplicado] = useState(null);
  const [errorCupon,    setErrorCupon]    = useState("");
  const [loadingCupon,  setLoadingCupon]  = useState(false);

  const clienteId = localStorage.getItem("cliente_id");

  const aplicarCupon = async () => {
    if (!codigoCupon.trim()) return;
    setLoadingCupon(true);
    setErrorCupon("");
    try {
      const data = await validarCupon({
        codigo:      codigoCupon.trim(),
        empresa_id:  empresaId,
        subtotal:    totalPrecio,
        costo_envio: costoEnvio,
        cliente_id:  clienteId ? Number(clienteId) : null,
      });
      setCuponAplicado(data);
      setCodigoCupon("");
    } catch (err) {
      setErrorCupon(err.response?.data?.error || "Cupón no válido");
      setCuponAplicado(null);
    } finally {
      setLoadingCupon(false);
    }
  };

  const quitarCupon = () => {
    setCuponAplicado(null);
    setErrorCupon("");
    setCodigoCupon("");
  };

  const descuentoCupon = cuponAplicado?.descuento || 0;
  const totalConEnvio  = totalPrecio + costoEnvioEfectivo - descuentoCupon - descuentoRefMonto;

  // Checkout con pasarela
  const metodoSeleccionado = metodosPago.find(m => m.id === metodoPagoId);
  const esMetodoTarjeta = metodoSeleccionado?.metodo?.toLowerCase() === "tarjeta";

  const {
    abierto: checkoutAbierto,
    stripePromise,
    clientSecret,
    loadingIntent,
    errorCheckout,
    tienePasarela,
    abrirCheckout,
    cerrarCheckout,
  } = useCheckout({
    empresaId,
    carrito,
    totalPrecio:     totalConEnvio,
    direccion,
    notas,
    metodoPagoId,
    cuponId:         cuponAplicado?.cupon_id  || null,
    descuentoCupon:  descuentoCupon + descuentoRefMonto,
    onPedidoCreado,
  });

  const usarStripe = tienePasarela && esMetodoTarjeta;

  // Confirmación post-pedido para métodos manuales
  const [pedidoExitoso, setPedidoExitoso] = useState(false);
  const [metodoConfirmado, setMetodoConfirmado] = useState(null);
  const prevLoadingPedido = useRef(false);

  useEffect(() => {
    if (prevLoadingPedido.current && !loadingPedido && !errorPedido && metodoConfirmado) {
      setPedidoExitoso(true);
    }
    prevLoadingPedido.current = loadingPedido;
  }, [loadingPedido, errorPedido]);

  useEffect(() => {
    if (!carritoAbierto) {
      setPedidoExitoso(false);
      setMetodoConfirmado(null);
      prevLoadingPedido.current = false;
    }
  }, [carritoAbierto]);

  const handleConfirmarPedido = () => {
    setMetodoConfirmado(metodoSeleccionado?.metodo?.toLowerCase());
    confirmarPedido(totalConEnvio, cuponAplicado?.cupon_id || null, descuentoCupon + descuentoRefMonto);
  };

  if (!carritoAbierto) return null;

  return (
    <>
      <div style={s.overlay} onClick={() => setCarritoAbierto(false)} />

      <div style={s.panel}>

        {/* Header */}
        <div style={s.header}>
          <div style={s.headerLeft}>
            <div style={s.headerIconWrap}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 3h1.5l2.5 9h8l2-6H6" stroke="#3674B5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="9" cy="16" r="1.2" fill="#3674B5"/>
                <circle cx="14" cy="16" r="1.2" fill="#3674B5"/>
              </svg>
            </div>
            <div>
              <h3 style={s.headerTitle}>Tu carrito</h3>
              <p style={s.headerSub}>
                {carrito.length === 0
                  ? "Vacío"
                  : `${carrito.length} producto${carrito.length !== 1 ? "s" : ""} · ${totalItems.toFixed(1)} kg`}
              </p>
            </div>
          </div>
          <button style={s.closeBtn} onClick={() => setCarritoAbierto(false)}>✕</button>
        </div>

        {/* Contenido */}
        <div style={s.body}>

          {pedidoExitoso ? (
            /* Panel de confirmación post-pedido */
            <div style={s.exitoPanel}>
              <div style={s.exitoIconWrap}>
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                  <circle cx="28" cy="28" r="28" fill="#eff6ff"/>
                  <path d="M16 28l10 10 14-20" stroke="#3674B5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 style={s.exitoTitle}>Pedido confirmado</h3>
              <p style={s.exitoInstrucciones}>{instruccionesPago(metodoConfirmado)}</p>
              <button style={s.btnCerrarExito} onClick={() => setCarritoAbierto(false)}>Cerrar</button>
            </div>

          ) : carrito.length === 0 ? (
            /* Estado vacío */
            <div style={s.empty}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect width="48" height="48" rx="12" fill="#f1f5f9"/>
                <path d="M12 16h4l5 16h10l4-12H18" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p style={s.emptyTitle}>Tu carrito está vacío</p>
              <p style={s.emptyDesc}>Agrega productos del catálogo</p>
            </div>

          ) : (
            <>
              {/* Items */}
              <div style={s.items}>
                {carrito.map((item) => (
                  <div key={item.id} style={s.item}>
                    <div style={s.itemInfo}>
                      <p style={s.itemNombre}>{item.nombre}</p>
                      <p style={s.itemPrecio}>${Number(item.precio).toLocaleString("es-CO")} / {item.unidad || "uds."}</p>
                    </div>
                    <div style={s.itemKilos}>
                      <button style={s.kilosBtn} onClick={() => cambiarCantidad(item.id, item.cantidad - 0.5)}>−</button>
                      <span style={s.kilosVal}>{Number(item.cantidad).toFixed(1)}</span>
                      <button style={s.kilosBtn} onClick={() => cambiarCantidad(item.id, item.cantidad + 0.5)}>+</button>
                    </div>
                    <div style={s.itemRight}>
                      <p style={s.itemSubtotal}>${(item.cantidad * item.precio).toLocaleString("es-CO")}</p>
                      <button style={s.quitarBtn} onClick={() => quitarDelCarrito(item.id)}>✕</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Selector de envío */}
              <EnvioForm empresa_id={empresaId} onCostoChange={handleCostoEnvio} />

              {/* Cupón */}
              <div>
                <label style={s.label}>¿Tienes un cupón?</label>
                {cuponAplicado ? (
                  <div style={s.cuponAplicado}>
                    <div>
                      <span style={s.cuponCodigo}>{cuponAplicado.codigo}</span>
                      {cuponAplicado.descripcion && (
                        <span style={s.cuponDesc}> · {cuponAplicado.descripcion}</span>
                      )}
                      <span style={s.cuponDescuento}> −${descuentoCupon.toLocaleString("es-CO")}</span>
                    </div>
                    <button style={s.cuponQuitarBtn} onClick={quitarCupon}>✕</button>
                  </div>
                ) : (
                  <div style={s.cuponInputWrap}>
                    <input
                      style={s.cuponInput}
                      placeholder="Ingresa el código"
                      value={codigoCupon}
                      onChange={(e) => { setCodigoCupon(e.target.value.toUpperCase()); setErrorCupon(""); }}
                      onKeyDown={(e) => e.key === "Enter" && aplicarCupon()}
                    />
                    <button
                      style={{ ...s.cuponBtn, opacity: loadingCupon ? 0.7 : 1 }}
                      onClick={aplicarCupon}
                      disabled={loadingCupon || !codigoCupon.trim()}
                    >
                      {loadingCupon ? "..." : "Aplicar"}
                    </button>
                  </div>
                )}
                {errorCupon && <p style={s.cuponError}>{errorCupon}</p>}
              </div>

              {/* Totales */}
              <div style={s.totalWrap}>
                {(costoEnvio > 0 || descuentoCupon > 0 || tieneDescuentoRef) && (
                  <div style={s.subtotalRow}>
                    <span style={s.subtotalLabel}>Subtotal productos</span>
                    <span style={s.subtotalValor}>${totalPrecio.toLocaleString("es-CO")}</span>
                  </div>
                )}
                {costoEnvio > 0 && !envioGratisRef && (
                  <div style={s.subtotalRow}>
                    <span style={s.subtotalLabel}>Envío</span>
                    <span style={s.subtotalValor}>+ ${costoEnvio.toLocaleString("es-CO")}</span>
                  </div>
                )}
                {envioGratisRef && costoEnvio > 0 && (
                  <div style={s.subtotalRow}>
                    <span style={{ ...s.subtotalLabel, color: "#3674B5" }}>Envío</span>
                    <span style={{ ...s.subtotalValor, color: "#3674B5", fontWeight: "700" }}>Gratis</span>
                  </div>
                )}
                {tieneDescuentoRef && descuentoRefMonto > 0 && (
                  <div style={s.subtotalRow}>
                    <span style={{ ...s.subtotalLabel, color: "#3674B5" }}>
                      Descuento referido ({descuentoRefPct}%)
                    </span>
                    <span style={{ ...s.subtotalValor, color: "#3674B5", fontWeight: "700" }}>
                      −${descuentoRefMonto.toLocaleString("es-CO")}
                    </span>
                  </div>
                )}
                {descuentoCupon > 0 && (
                  <div style={s.subtotalRow}>
                    <span style={{ ...s.subtotalLabel, color: "#3674B5" }}>Cupón {cuponAplicado?.codigo}</span>
                    <span style={{ ...s.subtotalValor, color: "#3674B5", fontWeight: "700" }}>
                      −${descuentoCupon.toLocaleString("es-CO")}
                    </span>
                  </div>
                )}
                <div style={s.totalRow}>
                  <span style={s.totalLabel}>Total</span>
                  <span style={s.totalValor}>${totalConEnvio.toLocaleString("es-CO")}</span>
                </div>
              </div>

              {/* Formulario */}
              <div style={s.form}>

                <div style={s.fieldWrap}>
                  <label style={s.label}>Dirección de entrega</label>
                  <input
                    style={{ ...s.input, borderColor: errorPedido && !direccion ? "#fca5a5" : "#e2e8f0" }}
                    placeholder="Calle 123 #45-67, Apto 201"
                    value={direccion}
                    onChange={(e) => { setDireccion(e.target.value); setErrorPedido(""); }}
                  />
                </div>

                {metodosPago.length > 0 && (
                  <div style={s.fieldWrap}>
                    <label style={s.label}>Método de pago</label>
                    <div style={s.metodosGrid}>
                      {metodosPago.map((m) => (
                        <button
                          key={m.id}
                          style={{
                            ...s.metodoBtn,
                            backgroundColor: metodoPagoId === m.id ? "#eff6ff" : "white",
                            borderColor:     metodoPagoId === m.id ? "#3674B5" : "#e2e8f0",
                            color:           metodoPagoId === m.id ? "#3674B5" : "#64748b",
                            fontWeight:      metodoPagoId === m.id ? "700" : "500",
                          }}
                          onClick={() => setMetodoPagoId(m.id)}
                        >
                          {capitalize(m.metodo)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div style={s.fieldWrap}>
                  <label style={s.label}>Notas (opcional)</label>
                  <textarea
                    style={s.textarea}
                    placeholder="Instrucciones especiales..."
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    rows={2}
                  />
                </div>

                {errorPedido && (
                  <div style={s.errorBox}>{errorPedido}</div>
                )}

                {usarStripe ? (
                  <button
                    style={{ ...s.btnConfirmar, background: "#3674B5" }}
                    onClick={abrirCheckout}
                    disabled={!direccion.trim() || loadingIntent}
                  >
                    {loadingIntent ? "Iniciando pago..." : `Ir a pagar · $${totalConEnvio.toLocaleString("es-CO")}`}
                  </button>
                ) : (
                  <button
                    style={{ ...s.btnConfirmar, opacity: loadingPedido ? 0.75 : 1, cursor: loadingPedido ? "not-allowed" : "pointer" }}
                    onClick={handleConfirmarPedido}
                    disabled={loadingPedido}
                  >
                    {loadingPedido
                      ? "Enviando pedido..."
                      : estaLogueado
                      ? `Confirmar pedido · $${totalConEnvio.toLocaleString("es-CO")}`
                      : "Inicia sesión para pedir"}
                  </button>
                )}

                {usarStripe && (
                  <p style={s.seguridadNote}>Pago seguro con Stripe · Datos encriptados</p>
                )}

                <button style={s.btnVaciar} onClick={vaciarCarrito}>Vaciar carrito</button>
              </div>
            </>
          )}
        </div>
      </div>

      <CheckoutModal
        abierto={checkoutAbierto}
        onCerrar={cerrarCheckout}
        stripePromise={stripePromise}
        clientSecret={clientSecret}
        loadingIntent={loadingIntent}
        errorCheckout={errorCheckout}
        totalPrecio={totalConEnvio}
        carrito={carrito}
        empresaNombre={empresaNombre}
        onPagoExitoso={onPagoExitoso}
      />
    </>
  );
}

function instruccionesPago(metodo) {
  if (metodo === "nequi")
    return "Envía el monto exacto al número de Nequi registrado por el negocio. Tu pedido se activará una vez confirmemos la transferencia.";
  if (metodo === "transferencia")
    return "Realiza la transferencia bancaria a la cuenta del negocio y comparte el comprobante. Tu pedido se activará una vez confirmemos el pago.";
  return "Tu pedido quedó registrado y está pendiente de pago. El negocio se pondrá en contacto contigo para coordinar el cobro.";
}

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const s = {
  overlay:      { position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.5)", zIndex: 200, backdropFilter: "blur(2px)" },
  panel:        { position: "fixed", top: 0, right: 0, bottom: 0, width: "420px", backgroundColor: "white", zIndex: 201, display: "flex", flexDirection: "column", boxShadow: "-8px 0 40px rgba(0,0,0,0.15)", fontFamily: "'Inter', 'Segoe UI', sans-serif" },
  header:       { padding: "20px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f8fafc" },
  headerLeft:   { display: "flex", alignItems: "center", gap: "12px" },
  headerIconWrap: { width: "36px", height: "36px", backgroundColor: "#eff6ff", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  headerTitle:  { fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: 0 },
  headerSub:    { fontSize: "12px", color: "#64748b", margin: 0 },
  closeBtn:     { background: "none", border: "none", fontSize: "16px", cursor: "pointer", color: "#64748b", padding: "4px 8px", borderRadius: "6px" },
  body:         { flex: 1, overflowY: "auto", padding: "16px 24px", display: "flex", flexDirection: "column", gap: "16px" },

  // Estado vacío
  empty:        { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", padding: "60px 0" },
  emptyTitle:   { fontSize: "15px", fontWeight: "600", color: "#64748b", margin: 0 },
  emptyDesc:    { fontSize: "13px", color: "#94a3b8", margin: 0 },

  // Éxito post-pedido
  exitoPanel:        { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "14px", padding: "40px 20px", textAlign: "center" },
  exitoIconWrap:     { marginBottom: "4px" },
  exitoTitle:        { fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: 0 },
  exitoInstrucciones:{ fontSize: "13px", color: "#64748b", lineHeight: "1.6", maxWidth: "300px", margin: 0 },
  btnCerrarExito:    { marginTop: "8px", padding: "12px 28px", backgroundColor: "#3674B5", color: "white", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer" },

  // Items
  items:        { display: "flex", flexDirection: "column", gap: "10px" },
  item:         { display: "flex", alignItems: "center", gap: "10px", padding: "12px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" },
  itemInfo:     { flex: 1, minWidth: 0 },
  itemNombre:   { fontSize: "13px", fontWeight: "600", color: "#0f172a", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  itemPrecio:   { fontSize: "11px", color: "#94a3b8", margin: 0 },
  itemKilos:    { display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 },
  kilosBtn:     { width: "22px", height: "22px", borderRadius: "6px", border: "1px solid #e2e8f0", backgroundColor: "white", fontSize: "13px", cursor: "pointer", color: "#3674B5", display: "flex", alignItems: "center", justifyContent: "center" },
  kilosVal:     { fontSize: "12px", fontWeight: "600", color: "#0f172a", minWidth: "32px", textAlign: "center" },
  itemRight:    { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", flexShrink: 0 },
  itemSubtotal: { fontSize: "13px", fontWeight: "700", color: "#3674B5", margin: 0 },
  quitarBtn:    { background: "none", border: "none", cursor: "pointer", fontSize: "13px", color: "#cbd5e1", padding: 0, transition: "color 0.12s" },

  // Totales
  totalWrap:    { display: "flex", flexDirection: "column", gap: "6px" },
  subtotalRow:  { display: "flex", justifyContent: "space-between", padding: "4px 8px" },
  subtotalLabel:{ fontSize: "12px", color: "#94a3b8" },
  subtotalValor:{ fontSize: "12px", color: "#94a3b8" },
  totalRow:     { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", backgroundColor: "#eff6ff", borderRadius: "12px", border: "1px solid #bfdbfe" },
  totalLabel:   { fontSize: "14px", fontWeight: "700", color: "#0f172a" },
  totalValor:   { fontSize: "20px", fontWeight: "800", color: "#3674B5" },

  // Formulario
  form:         { display: "flex", flexDirection: "column", gap: "14px" },
  fieldWrap:    {},
  label:        { display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "6px" },
  input:        { width: "100%", padding: "10px 12px", borderRadius: "9px", border: "1.5px solid #e2e8f0", fontSize: "13px", color: "#0f172a", backgroundColor: "white", outline: "none", boxSizing: "border-box" },
  textarea:     { width: "100%", padding: "10px 12px", borderRadius: "9px", border: "1.5px solid #e2e8f0", fontSize: "13px", color: "#0f172a", backgroundColor: "white", outline: "none", boxSizing: "border-box", resize: "none", fontFamily: "inherit" },
  metodosGrid:  { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" },
  metodoBtn:    { padding: "8px 10px", borderRadius: "8px", border: "1.5px solid", fontSize: "12px", cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center" },
  errorBox:     { backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "10px 12px", fontSize: "12px", color: "#b91c1c" },
  btnConfirmar: { width: "100%", padding: "13px", backgroundColor: "#3674B5", color: "white", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "700", transition: "opacity 0.2s", cursor: "pointer" },
  seguridadNote:{ textAlign: "center", fontSize: "11px", color: "#94a3b8", margin: 0 },
  btnVaciar:    { width: "100%", padding: "10px", background: "transparent", color: "#94a3b8", border: "none", fontSize: "12px", cursor: "pointer", textDecoration: "underline" },

  // Cupón
  cuponInputWrap: { display: "flex", gap: "8px", marginTop: "6px" },
  cuponInput: {
    flex: 1, padding: "9px 12px", borderRadius: "9px",
    border: "1.5px solid #e2e8f0", fontSize: "13px",
    color: "#0f172a", outline: "none",
    fontFamily: "'DM Mono', monospace", letterSpacing: "0.05em",
  },
  cuponBtn: {
    padding: "9px 14px", borderRadius: "9px",
    backgroundColor: "#0f172a", color: "white",
    border: "none", fontSize: "12px", fontWeight: "700",
    cursor: "pointer", flexShrink: 0,
  },
  cuponAplicado: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "9px 12px", marginTop: "6px",
    backgroundColor: "#eff6ff", border: "1.5px solid #bfdbfe",
    borderRadius: "9px",
  },
  cuponCodigo:   { fontSize: "13px", fontWeight: "700", color: "#0f172a", fontFamily: "'DM Mono', monospace" },
  cuponDesc:     { fontSize: "12px", color: "#64748b" },
  cuponDescuento:{ fontSize: "13px", fontWeight: "700", color: "#3674B5" },
  cuponQuitarBtn:{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "13px" },
  cuponError:    { fontSize: "11px", color: "#b91c1c", marginTop: "4px" },
};
