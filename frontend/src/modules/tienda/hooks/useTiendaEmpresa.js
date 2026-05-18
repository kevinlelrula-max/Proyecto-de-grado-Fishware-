import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getProductosPublicos, crearPedidoOnline, getMetodosPago, getEmpresaPorSlug } from "../../../services/api";

// ─── Hook principal ──────────────────────────────────────────────────────────
export function useTiendaEmpresa(empresaIdProp, empresaSlug) {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ empresaId puede venir por prop o buscarse por slug
  const [empresaId, setEmpresaId]           = useState(empresaIdProp || null);
  const [empresaData, setEmpresaData]       = useState(null);
  const [loadingEmpresa, setLoadingEmpresa] = useState(!empresaIdProp);

  // ── Estado de productos
  const [productos, setProductos]       = useState([]);
  const [loadingProds, setLoadingProds] = useState(true);
  const [busqueda, setBusqueda]         = useState("");

  // ── Estado carrito
  const [carrito, setCarrito]               = useState([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);

  // ── Estado pedido
  const [metodosPago, setMetodosPago]     = useState([]);
  const [metodoPagoId, setMetodoPagoId]   = useState(null);
  const [direccion, setDireccion]         = useState(
    localStorage.getItem("cliente_direccion") || ""
  );
  const [notas, setNotas]                 = useState("");
  const [loadingPedido, setLoadingPedido] = useState(false);
  const [pedidoExitoso, setPedidoExitoso] = useState(null);
  const [errorPedido, setErrorPedido]     = useState("");

  // ── Auth
  const clienteNombre = localStorage.getItem("cliente_nombre");
  const estaLogueado  = !!localStorage.getItem("cliente_token");

  // ✅ Si no viene empresaId por prop, buscar la empresa por slug
  useEffect(() => {
    if (empresaIdProp) {
      setEmpresaId(empresaIdProp);
      setLoadingEmpresa(false);
      return;
    }
    if (!empresaSlug) return;

    setLoadingEmpresa(true);
    getEmpresaPorSlug(empresaSlug)
      .then((data) => {
        if (data) {
          setEmpresaId(data.id);
          setEmpresaData(data);
          localStorage.setItem("ultima_empresa", JSON.stringify(data));
        }
      })
      .finally(() => setLoadingEmpresa(false));
  }, [empresaIdProp, empresaSlug]);

  // ── Cargar productos — espera a tener el empresaId real
  useEffect(() => {
    if (!empresaId) return;

    setLoadingProds(true);
    getProductosPublicos(empresaId)
      .then(setProductos)
      .finally(() => setLoadingProds(false));
  }, [empresaId]);

  // ── Cargar métodos de pago
  useEffect(() => {
    getMetodosPago().then((data) => {
      setMetodosPago(data);
      if (data.length > 0) setMetodoPagoId(data[0].id);
    });
  }, []);

  // ── Filtrar productos por búsqueda
  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // ── CARRITO: agregar producto
  const agregarAlCarrito = useCallback((producto, kilos = 1) => {
    if (!localStorage.getItem("cliente_token")) {
      navigate("/tienda/login", { state: { from: location.pathname } });
      return;
    }
    if (producto.stock <= 0) return;

    setCarrito((prev) => {
      const existe = prev.find((item) => item.id === producto.id);
      if (existe) {
        const nuevosKilos = Math.min(existe.kilos + kilos, producto.stock);
        return prev.map((item) =>
          item.id === producto.id ? { ...item, kilos: nuevosKilos } : item
        );
      }
      return [...prev, { ...producto, kilos }];
    });

    setCarritoAbierto(true);
  }, [navigate, location.pathname]);

  // ── CARRITO: cambiar cantidad
  const cambiarKilos = useCallback((productoId, kilos) => {
    if (kilos <= 0) {
      quitarDelCarrito(productoId);
      return;
    }
    setCarrito((prev) =>
      prev.map((item) =>
        item.id === productoId
          ? { ...item, kilos: Math.min(kilos, item.stock) }
          : item
      )
    );
  }, []);

  // ── CARRITO: quitar producto
  const quitarDelCarrito = useCallback((productoId) => {
    setCarrito((prev) => prev.filter((item) => item.id !== productoId));
  }, []);

  // ── CARRITO: vaciar
  const vaciarCarrito = useCallback(() => setCarrito([]), []);

  // ── CARRITO: totales
  const totalItems  = carrito.reduce((acc, item) => acc + item.kilos, 0);
  const totalPrecio = carrito.reduce((acc, item) => acc + item.kilos * item.precio, 0);

  // ── PEDIDO: confirmar
  const confirmarPedido = useCallback(async (totalFinal = totalPrecio, cuponId = null, descuentoCupon = 0) => {
    const clienteToken = localStorage.getItem("cliente_token");
    const clienteId    = localStorage.getItem("cliente_id");

    if (!clienteToken) {
      navigate("/tienda/login", { state: { from: location.pathname } });
      return;
    }
    if (carrito.length === 0) return;
    if (!direccion.trim()) {
      setErrorPedido("Por favor ingresa una dirección de entrega.");
      return;
    }
    if (!metodoPagoId) {
      setErrorPedido("Por favor selecciona un método de pago.");
      return;
    }

    setLoadingPedido(true);
    setErrorPedido("");

    try {
      const payload = {
        empresa_id:        empresaId,
        cliente_id:        Number(clienteId),
        metodo_pago_id:    metodoPagoId,
        direccion_entrega: direccion.trim(),
        notas:             notas.trim() || null,
        total:             totalFinal,
        cupon_id:          cuponId        || null,
        descuento:         descuentoCupon || 0,
        detalle: carrito.map((item) => ({
          producto_id:     item.id,
          kilos:           item.kilos,
          precio_unitario: item.precio,
        })),
      };

      const res = await crearPedidoOnline(payload, clienteToken);

      if (res.id) {
        localStorage.setItem("cliente_direccion", direccion);
        setPedidoExitoso({ id: res.id, total: totalFinal });
        vaciarCarrito();
        setCarritoAbierto(false);
      } else {
        setErrorPedido(res.error || "Error al crear el pedido. Intenta de nuevo.");
      }
    } catch {
      setErrorPedido("No se pudo conectar. Intenta de nuevo.");
    } finally {
      setLoadingPedido(false);
    }
  }, [
    carrito, direccion, metodoPagoId,
    empresaId, totalPrecio,
    notas, navigate, location.pathname, vaciarCarrito,
  ]);

  const cerrarExito = useCallback(() => {
    setPedidoExitoso(null);
    navigate("/tienda/mis-pedidos");
  }, [navigate]);

  return {
    // Empresa
    empresaId,
    empresaData,
    loadingEmpresa,

    // Productos
    productos: productosFiltrados,
    loadingProds,
    busqueda,
    setBusqueda,

    // Carrito
    carrito,
    carritoAbierto,
    setCarritoAbierto,
    agregarAlCarrito,
    cambiarKilos,
    quitarDelCarrito,
    vaciarCarrito,
    totalItems,
    totalPrecio,

    // Pedido
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
    pedidoExitoso,
    confirmarPedido,
    cerrarExito,

    // Auth
    estaLogueado,
    clienteNombre,
  };
}