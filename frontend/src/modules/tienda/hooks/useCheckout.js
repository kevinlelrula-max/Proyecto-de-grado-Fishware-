import { useState, useCallback, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function useCheckout({ empresaId, carrito, totalPrecio, direccion, notas, metodoPagoId, cuponId, descuentoCupon, onPedidoCreado }) {
  const clienteToken = localStorage.getItem("cliente_token");
  const clienteId    = localStorage.getItem("cliente_id");
  const headers      = { Authorization: `Bearer ${clienteToken}` };

  const [abierto, setAbierto]               = useState(false);
  const [stripePromise, setStripePromise]   = useState(null);
  const [clientSecret, setClientSecret]     = useState(null);
  const [loadingIntent, setLoadingIntent]   = useState(false);
  const [errorCheckout, setErrorCheckout]   = useState("");
  const [pasarelasActivas, setPasarelasActivas] = useState([]);
  const [cargandoPasarelas, setCargandoPasarelas] = useState(false);

  // ── Cargar pasarelas al montar (para que tienePasarela sea correcto desde el inicio) ──
  useEffect(() => {
    if (!empresaId) return;
    setCargandoPasarelas(true);
    axios
      .get(`${API_URL}/api/integraciones/publicas/${empresaId}`)
      .then(res => setPasarelasActivas(res.data))
      .catch(() => setPasarelasActivas([]))
      .finally(() => setCargandoPasarelas(false));
  }, [empresaId]);

  // ── Cargar pasarelas (también usada dentro de abrirCheckout para tener data fresca) ──
  const cargarPasarelas = useCallback(async () => {
    if (!empresaId) return pasarelasActivas;
    try {
      const res = await axios.get(`${API_URL}/api/integraciones/publicas/${empresaId}`);
      setPasarelasActivas(res.data);
      return res.data;
    } catch {
      return pasarelasActivas;
    }
  }, [empresaId, pasarelasActivas]);

  // ── Abrir checkout ────────────────────────────────────────────────────────
  const abrirCheckout = useCallback(async () => {
    setErrorCheckout("");
    const pasarelas = await cargarPasarelas();
    const tieneStripe = pasarelas.find(p => p.proveedor === "stripe");

    if (tieneStripe) {
      const stripe = await loadStripe(tieneStripe.llave_publica);
      setStripePromise(loadStripe(tieneStripe.llave_publica));

      setLoadingIntent(true);
      try {
        const pedidoRes = await axios.post(
          `${API_URL}/api/pedidos`,
          {
            empresa_id:        empresaId,
            cliente_id:        Number(clienteId),
            metodo_pago_id:    metodoPagoId,
            direccion_entrega: direccion,
            notas:             notas || null,
            total:             totalPrecio,
            cupon_id:          cuponId   || null,
            descuento:         descuentoCupon || 0,
            detalle: carrito.map(item => ({
              producto_id:     item.id,
              cantidad:        item.cantidad,
              precio_unitario: item.precio,
            })),
          },
          { headers }
        );

        if (!pedidoRes.data.id) throw new Error("Error creando pedido");

        const pedidoId = pedidoRes.data.id;

        const intentRes = await axios.post(
          `${API_URL}/api/pagos/crear-payment-intent`,
          { empresa_id: empresaId, pedido_id: pedidoId, monto: totalPrecio },
          { headers }
        );

        setClientSecret(intentRes.data.clientSecret);
        onPedidoCreado?.(pedidoId);
      } catch (e) {
        setErrorCheckout(e.response?.data?.error || "Error al iniciar el pago. Intenta de nuevo.");
        setLoadingIntent(false);
        return;
      }
      setLoadingIntent(false);
    }

    setAbierto(true);
  }, [cargarPasarelas, empresaId, clienteId, carrito, totalPrecio, direccion, notas, metodoPagoId, cuponId, descuentoCupon, headers, onPedidoCreado]);

  const cerrarCheckout = useCallback(() => {
    setAbierto(false);
    setClientSecret(null);
    setErrorCheckout("");
  }, []);

  const tieneStripe   = pasarelasActivas.some(p => p.proveedor === "stripe");
  const tieneWompi    = pasarelasActivas.some(p => p.proveedor === "wompi");
  const tienePasarela = tieneStripe || tieneWompi;

  return {
    abierto,
    stripePromise,
    clientSecret,
    loadingIntent,
    errorCheckout,
    pasarelasActivas,
    cargandoPasarelas,
    tienePasarela,
    tieneStripe,
    tieneWompi,
    abrirCheckout,
    cerrarCheckout,
  };
}