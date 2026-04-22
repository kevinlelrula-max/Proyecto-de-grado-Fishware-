import { useEffect, useState } from "react";
import { getProductos } from "../productos/services/productos.api";
import { buscarClientes, crearCliente } from "../clientes/services/clientes.api";
import { crearVenta, listarVentasHoy } from "./services/pos.api";
import { getDepartamentos, getMunicipios } from "../ubicacion/services/ubicacion.api";

// ─── Componente principal ─────────────────────────────────────────────────────
export default function PuntoDeVenta() {
  const token = localStorage.getItem("token");

  const [pestana, setPestana] = useState("venta");

  // Estados — Nueva venta
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [metodoPago, setMetodoPago] = useState(1);
  const [total, setTotal] = useState(0);
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [ventaExitosa, setVentaExitosa] = useState(null);

  // Estados — Historial / Caja
  const [ventasHoy, setVentasHoy] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  // Estados — Formulario nuevo cliente
  const [mostrarFormCliente, setMostrarFormCliente] = useState(false);
  const [creandoCliente, setCreandoCliente] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: "", apellido: "", telefono: "", direccion: "",
    tipo_documento: "Cédula de ciudadanía", numero_documento: "",
    id_departamento: "", id_municipio: ""
  });

  // Estados — Ubicación desde backend
  const [departamentos, setDepartamentos] = useState([]);
  const [municipios, setMunicipios] = useState([]);

  // Cargar departamentos desde el backend al montar
  useEffect(() => {
  getDepartamentos(token).then(data => {
    console.log("Departamentos recibidos:", data);
    setDepartamentos(data);
  }).catch(console.error);
}, []);

  // Cargar municipios cuando cambia el departamento seleccionado
  // En PuntoDeVenta.jsx, en el useEffect de municipios:
useEffect(() => {
  if (!nuevoCliente.id_departamento) { setMunicipios([]); return; }
  console.log("Buscando municipios para departamento:", nuevoCliente.id_departamento, typeof nuevoCliente.id_departamento);
  getMunicipios(nuevoCliente.id_departamento, token)
    .then(data => {
      console.log("Municipios recibidos:", data);
      setMunicipios(data);
    })
    .catch(err => console.error("Error municipios:", err));
}, [nuevoCliente.id_departamento]);

  // Cargar productos
  useEffect(() => {
    getProductos(token).then(setProductos);
  }, []);

  // Cargar historial
  useEffect(() => {
    if (pestana === "historial" || pestana === "caja") {
      setCargandoHistorial(true);
      listarVentasHoy(token)
        .then(setVentasHoy)
        .catch(console.error)
        .finally(() => setCargandoHistorial(false));
    }
  }, [pestana]);

  // Buscar clientes — debounce
  useEffect(() => {
    if (busquedaCliente.length < 2) { setClientes([]); return; }
    const timer = setTimeout(async () => {
      const data = await buscarClientes(busquedaCliente, token);
      setClientes(data);
    }, 400);
    return () => clearTimeout(timer);
  }, [busquedaCliente]);

  // Lógica carrito
  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase())
  );

  const agregarProducto = (producto) => {
    if (producto.stock <= 0) return;
    const existe = carrito.find(p => p.id === producto.id);
    if (existe) {
      if (existe.cantidad >= producto.stock) return;
      setCarrito(carrito.map(p => p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p));
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
  };

  const cambiarCantidad = (id, cantidad) => {
    const producto = productos.find(p => p.id === id);
    if (cantidad <= 0) return;
    if (producto && cantidad > producto.stock) return;
    setCarrito(carrito.map(p => p.id === id ? { ...p, cantidad } : p));
  };

  const eliminarProducto = (id) => setCarrito(carrito.filter(p => p.id !== id));

  useEffect(() => {
    setTotal(carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0));
  }, [carrito]);

  // Confirmar venta
  const confirmarVenta = async () => {
    if (!clienteSeleccionado) { alert("Selecciona un cliente"); return; }
    if (carrito.length === 0) { alert("El carrito está vacío"); return; }
    const payload = {
      cliente_id: clienteSeleccionado.id,
      metodo_pago_id: Number(metodoPago),
      productos: carrito.map(p => ({ producto_id: p.id, cantidad: p.cantidad }))
    };
    try {
      const res = await crearVenta(payload, token);
      setVentaExitosa(res);
      setCarrito([]);
      setClienteSeleccionado(null);
      setBusquedaCliente("");
      setTimeout(() => setVentaExitosa(null), 4000);
    } catch (error) {
      alert(error.response?.data?.error || "Error en venta");
    }
  };

  // Crear cliente nuevo
  const handleCampoCliente = (e) => {
    const { name, value } = e.target;
    setNuevoCliente(prev => ({
      ...prev,
      [name]: value,
      ...(name === "id_departamento" ? { id_municipio: "" } : {})
    }));
  };

  const handleCrearCliente = async () => {
    if (!nuevoCliente.nombre.trim()) { alert("El nombre es obligatorio"); return; }
    setCreandoCliente(true);
    try {
      const creado = await crearCliente({
        nombre:           nuevoCliente.nombre,
        apellido:         nuevoCliente.apellido,
        telefono:         nuevoCliente.telefono,
        direccion:        nuevoCliente.direccion,
        tipo_documento:   nuevoCliente.tipo_documento,
        numero_documento: nuevoCliente.numero_documento,
        id_municipio: nuevoCliente.id_municipio ? Number(nuevoCliente.id_municipio) : null,
      }, token);
      setClienteSeleccionado(creado);
      setBusquedaCliente(`${creado.nombre} ${creado.apellido || ""}`);
      setClientes([]);
      setMostrarFormCliente(false);
      setNuevoCliente({
        nombre: "", apellido: "", telefono: "", direccion: "",
        tipo_documento: "Cédula de ciudadanía", numero_documento: "",
        id_departamento: "", id_municipio: ""
      });
    } catch (error) {
      alert(error.response?.data?.error || "Error al crear cliente");
    } finally {
      setCreandoCliente(false);
    }
  };

  // Cálculos caja
  const totalDia = ventasHoy.reduce((acc, v) => acc + Number(v.total), 0);
  const totalVentas = ventasHoy.length;
  const ticketPromedio = totalVentas > 0 ? totalDia / totalVentas : 0;
  const porMetodo = ventasHoy.reduce((acc, v) => {
    const m = v.metodo_pago || "Otro";
    acc[m] = (acc[m] || 0) + Number(v.total);
    return acc;
  }, {});

  const metodos = [
    { id: 1, label: "Efectivo",      icon: "💵" },
    { id: 2, label: "Transferencia", icon: "🏦" },
    { id: 3, label: "Nequi",         icon: "📱" },
    { id: 4, label: "Tarjeta",       icon: "💳" },
  ];

  const tiposDocumento = [
    "Cédula de ciudadanía", "Cédula de extranjería",
    "Pasaporte", "Tarjeta de identidad", "NIT", "Otro"
  ];

  const fmt = (n) => Number(n).toLocaleString("es-CO");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

        .pos-wrap { font-family: 'DM Sans', sans-serif; display: flex; flex-direction: column; height: calc(100vh - 80px); }
        .pos-tabs { display: flex; border-bottom: 1.5px solid #f0f0f0; margin-bottom: 16px; }
        .pos-tab { padding: 10px 20px; font-size: 13px; font-weight: 500; color: #aaa; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.15s; display: flex; align-items: center; gap: 6px; }
        .pos-tab:hover { color: #555; }
        .pos-tab.active { color: #00A884; border-bottom-color: #00C9A7; }
        .pos-body { flex: 1; overflow: hidden; }
        .pos-root { display: grid; grid-template-columns: 1fr 380px; gap: 20px; height: 100%; }

        .pos-left { display: flex; flex-direction: column; gap: 14px; overflow: hidden; }
        .pos-search-bar { display: flex; align-items: center; gap: 10px; background: #fff; border: 1.5px solid #e8e8e8; border-radius: 14px; padding: 10px 16px; }
        .pos-search-bar input { border: none; outline: none; font-family: 'DM Sans', sans-serif; font-size: 14px; flex: 1; color: #1a1a1a; background: transparent; }
        .pos-product-grid { flex: 1; overflow-y: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; padding-right: 4px; }
        .pos-product-grid::-webkit-scrollbar { width: 4px; }
        .pos-product-grid::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }

        .prod-card { background: #fff; border: 1.5px solid #f0f0f0; border-radius: 16px; padding: 16px; cursor: pointer; transition: all 0.18s ease; position: relative; overflow: hidden; }
        .prod-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #00C9A7, #0099FF); opacity: 0; transition: opacity 0.18s; }
        .prod-card:hover { border-color: #00C9A7; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,201,167,0.12); }
        .prod-card:hover::before { opacity: 1; }
        .prod-card.agotado { opacity: 0.4; cursor: not-allowed; transform: none !important; box-shadow: none !important; }
        .prod-card-icon { width: 36px; height: 36px; background: linear-gradient(135deg, #E8FBF7, #D6F5FF); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; margin-bottom: 10px; }
        .prod-card-img { width: 100%; height: 80px; object-fit: cover; border-radius: 8px; margin-bottom: 10px; }
        .prod-card h3 { font-size: 13px; font-weight: 600; color: #1a1a1a; margin: 0 0 4px; }
        .prod-card .precio { font-family: 'DM Mono', monospace; font-size: 14px; font-weight: 500; color: #00A884; margin-bottom: 4px; }
        .prod-card .stock { font-size: 11px; color: #aaa; }
        .prod-card .stock.bajo { color: #F59E0B; }

        .pos-right { background: #fff; border: 1.5px solid #f0f0f0; border-radius: 20px; display: flex; flex-direction: column; overflow: hidden; }
        .pos-right-header { padding: 14px 20px 12px; border-bottom: 1px solid #f5f5f5; }
        .pos-right-header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .pos-right-header-top h2 { font-size: 15px; font-weight: 600; color: #1a1a1a; margin: 0; }

        .btn-nuevo-cliente { padding: 6px 12px; background: linear-gradient(135deg, #00C9A7, #0099FF); border: none; border-radius: 8px; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: opacity 0.15s; }
        .btn-nuevo-cliente:hover { opacity: 0.85; }

        .cliente-wrap { position: relative; }
        .cliente-input { width: 100%; padding: 9px 14px; border: 1.5px solid #eee; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 13px; outline: none; transition: border-color 0.15s; box-sizing: border-box; color: #1a1a1a; }
        .cliente-input:focus { border-color: #00C9A7; }
        .cliente-input.seleccionado { border-color: #00C9A7; background: #F0FBF8; color: #00875A; font-weight: 500; }
        .cliente-dropdown { position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: #fff; border: 1.5px solid #eee; border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.08); z-index: 20; overflow: hidden; }
        .cliente-option { padding: 10px 14px; cursor: pointer; font-size: 13px; color: #1a1a1a; border-bottom: 1px solid #f9f9f9; transition: background 0.1s; }
        .cliente-option:hover { background: #F0FBF8; }
        .cliente-option span { font-size: 11px; color: #aaa; margin-left: 6px; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; z-index: 100; }
        .modal-box { background: #fff; border-radius: 20px; padding: 24px; width: 440px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
        .modal-box::-webkit-scrollbar { width: 4px; }
        .modal-box::-webkit-scrollbar-thumb { background: #eee; border-radius: 4px; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .modal-header h3 { font-size: 15px; font-weight: 600; color: #1a1a1a; margin: 0; }
        .modal-close { background: none; border: none; font-size: 18px; color: #aaa; cursor: pointer; padding: 0; }
        .modal-close:hover { color: #555; }

        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .form-grid .full { grid-column: 1 / -1; }
        .form-field { display: flex; flex-direction: column; gap: 4px; }
        .form-label { font-size: 11px; font-weight: 600; color: #aaa; text-transform: uppercase; letter-spacing: 0.4px; }
        .form-input { padding: 8px 12px; border: 1.5px solid #eee; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 13px; outline: none; box-sizing: border-box; color: #1a1a1a; transition: border-color 0.15s; background: #fafafa; width: 100%; }
        .form-input:focus { border-color: #00C9A7; background: #fff; }
        .form-input:disabled { opacity: 0.45; cursor: not-allowed; }

        .modal-footer { display: flex; gap: 8px; margin-top: 20px; }
        .btn-guardar { flex: 1; padding: 11px; background: linear-gradient(135deg, #00C9A7, #0099FF); border: none; border-radius: 10px; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: opacity 0.15s; }
        .btn-guardar:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-guardar:hover:not(:disabled) { opacity: 0.9; }
        .btn-cancelar { padding: 11px 18px; background: #f5f5f5; border: none; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 13px; color: #555; cursor: pointer; }

        .carrito-wrap { flex: 1; overflow-y: auto; padding: 12px 20px; }
        .carrito-vacio { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #ccc; font-size: 13px; gap: 8px; }
        .carrito-vacio .icon { font-size: 36px; }
        .carrito-item { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f9f9f9; }
        .carrito-item:last-child { border-bottom: none; }
        .carrito-item-info { flex: 1; }
        .carrito-item-name { font-size: 13px; font-weight: 500; color: #1a1a1a; }
        .carrito-item-price { font-family: 'DM Mono', monospace; font-size: 11px; color: #aaa; margin-top: 2px; }
        .qty-control { display: flex; align-items: center; gap: 6px; }
        .qty-btn { width: 26px; height: 26px; border: 1.5px solid #eee; border-radius: 8px; background: #fafafa; cursor: pointer; font-size: 15px; display: flex; align-items: center; justify-content: center; color: #555; transition: all 0.12s; }
        .qty-btn:hover { background: #00C9A7; border-color: #00C9A7; color: #fff; }
        .qty-num { font-family: 'DM Mono', monospace; font-size: 13px; font-weight: 500; min-width: 20px; text-align: center; color: #1a1a1a; }
        .del-btn { background: none; border: none; cursor: pointer; color: #ddd; font-size: 16px; transition: color 0.12s; }
        .del-btn:hover { color: #FF4D4D; }

        .pos-footer { padding: 16px 20px; border-top: 1px solid #f5f5f5; }
        .metodos-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; }
        .metodo-btn { padding: 8px 6px; border: 1.5px solid #eee; border-radius: 10px; background: #fafafa; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500; color: #555; transition: all 0.15s; display: flex; align-items: center; justify-content: center; gap: 5px; }
        .metodo-btn:hover { border-color: #00C9A7; color: #00875A; background: #F0FBF8; }
        .metodo-btn.activo { border-color: #00C9A7; background: #E8FAF5; color: #00875A; font-weight: 600; }
        .total-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
        .total-label { font-size: 13px; color: #aaa; }
        .total-valor { font-family: 'DM Mono', monospace; font-size: 22px; font-weight: 500; color: #1a1a1a; }
        .btn-confirmar { width: 100%; padding: 13px; background: linear-gradient(135deg, #00C9A7, #0099FF); border: none; border-radius: 12px; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; transition: opacity 0.15s, transform 0.12s; }
        .btn-confirmar:hover { opacity: 0.9; transform: translateY(-1px); }
        .btn-confirmar:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }

        .historial-wrap { height: 100%; overflow-y: auto; background: #fff; border: 1.5px solid #f0f0f0; border-radius: 20px; }
        .historial-tabla { width: 100%; border-collapse: collapse; font-size: 13px; }
        .historial-tabla th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 600; color: #aaa; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1.5px solid #f0f0f0; background: #fafafa; }
        .historial-tabla td { padding: 13px 16px; border-bottom: 1px solid #f9f9f9; color: #1a1a1a; }
        .historial-tabla tr:last-child td { border-bottom: none; }
        .historial-tabla tr:hover td { background: #f9fffe; }
        .badge-metodo { font-size: 11px; padding: 3px 8px; border-radius: 99px; background: #E8FAF5; color: #00875A; font-weight: 500; }
        .historial-vacio { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 200px; color: #ccc; gap: 8px; font-size: 13px; }

        .caja-wrap { display: flex; flex-direction: column; gap: 16px; height: 100%; overflow-y: auto; }
        .caja-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .caja-stat { background: #f9fffe; border: 1.5px solid #E8FAF5; border-radius: 14px; padding: 18px; }
        .caja-stat-label { font-size: 12px; color: #aaa; margin-bottom: 6px; }
        .caja-stat-val { font-family: 'DM Mono', monospace; font-size: 22px; font-weight: 500; color: #1a1a1a; }
        .caja-stat-val.verde { color: #00A884; }
        .caja-metodos { background: #fff; border: 1.5px solid #f0f0f0; border-radius: 14px; padding: 18px; }
        .caja-metodos h3 { font-size: 13px; font-weight: 600; color: #1a1a1a; margin-bottom: 12px; }
        .metodo-row { display: flex; justify-content: space-between; align-items: center; padding: 11px 0; border-bottom: 1px solid #f9f9f9; font-size: 13px; }
        .metodo-row:last-child { border-bottom: none; }
        .metodo-row-label { color: #555; display: flex; align-items: center; gap: 8px; }
        .metodo-row-val { font-family: 'DM Mono', monospace; font-weight: 500; color: #1a1a1a; }

        .spinner { text-align: center; padding: 40px; color: #aaa; font-size: 13px; }
        .toast { position: fixed; bottom: 28px; right: 28px; background: #1a1a1a; color: #fff; padding: 14px 20px; border-radius: 14px; font-size: 13px; box-shadow: 0 12px 32px rgba(0,0,0,0.18); display: flex; align-items: center; gap: 10px; z-index: 200; animation: slideUp 0.3s ease; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="pos-wrap">
        {/* PESTAÑAS */}
        <div className="pos-tabs">
          <div className={`pos-tab ${pestana === "venta" ? "active" : ""}`} onClick={() => setPestana("venta")}>🛒 Nueva venta</div>
          <div className={`pos-tab ${pestana === "historial" ? "active" : ""}`} onClick={() => setPestana("historial")}>📋 Historial del día</div>
          <div className={`pos-tab ${pestana === "caja" ? "active" : ""}`} onClick={() => setPestana("caja")}>💰 Caja</div>
        </div>

        <div className="pos-body">
          {/* ════ NUEVA VENTA ════ */}
          {pestana === "venta" && (
            <div className="pos-root">
              <div className="pos-left">
                <div className="pos-search-bar">
                  <span>🔍</span>
                  <input placeholder="Buscar producto..." value={busquedaProducto} onChange={e => setBusquedaProducto(e.target.value)} />
                  {busquedaProducto && <span style={{ cursor: "pointer", color: "#aaa", fontSize: 13 }} onClick={() => setBusquedaProducto("")}>✕</span>}
                </div>
                <div className="pos-product-grid">
                  {productosFiltrados.map(p => (
                    <div key={p.id} className={`prod-card ${p.stock <= 0 ? "agotado" : ""}`} onClick={() => agregarProducto(p)}>
                      {p.imagen_url
                        ? <img src={`http://localhost:3000${p.imagen_url}`} alt={p.nombre} className="prod-card-img" onError={e => e.target.style.display = "none"} />
                        : <div className="prod-card-icon">🐟</div>}
                      <h3>{p.nombre}</h3>
                      <div className="precio">${fmt(p.precio)}</div>
                      <div className={`stock ${p.stock > 0 && p.stock < 20 ? "bajo" : ""}`}>
                        {p.stock <= 0 ? "Agotado" : `${p.stock} kg`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pos-right">
                <div className="pos-right-header">
                  <div className="pos-right-header-top">
                    <h2>🛒 Venta actual</h2>
                    <button className="btn-nuevo-cliente" onClick={() => setMostrarFormCliente(true)}>
                      ＋ Nuevo cliente
                    </button>
                  </div>
                  <div className="cliente-wrap">
                    <input
                      className={`cliente-input ${clienteSeleccionado ? "seleccionado" : ""}`}
                      placeholder="Buscar cliente por nombre o cédula..."
                      value={busquedaCliente}
                      onChange={e => { setBusquedaCliente(e.target.value); setClienteSeleccionado(null); }}
                    />
                    {clientes.length > 0 && !clienteSeleccionado && (
                      <div className="cliente-dropdown">
                        {clientes.map(c => (
                          <div key={c.id} className="cliente-option" onClick={() => {
                            setClienteSeleccionado(c);
                            setClientes([]);
                            setBusquedaCliente(`${c.nombre} ${c.apellido || ""}`);
                          }}>
                            {c.nombre} {c.apellido}
                            {c.numero_documento && <span>{c.numero_documento}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="carrito-wrap">
                  {carrito.length === 0 ? (
                    <div className="carrito-vacio"><span className="icon">🧺</span><span>Agrega productos para comenzar</span></div>
                  ) : carrito.map(p => (
                    <div key={p.id} className="carrito-item">
                      <div className="carrito-item-info">
                        <div className="carrito-item-name">{p.nombre}</div>
                        <div className="carrito-item-price">${fmt(p.precio)} × {p.cantidad} = ${fmt(p.precio * p.cantidad)}</div>
                      </div>
                      <div className="qty-control">
                        <button className="qty-btn" onClick={() => cambiarCantidad(p.id, p.cantidad - 1)}>−</button>
                        <span className="qty-num">{p.cantidad}</span>
                        <button className="qty-btn" onClick={() => cambiarCantidad(p.id, p.cantidad + 1)}>+</button>
                      </div>
                      <button className="del-btn" onClick={() => eliminarProducto(p.id)}>✕</button>
                    </div>
                  ))}
                </div>

                <div className="pos-footer">
                  <div className="metodos-grid">
                    {metodos.map(m => (
                      <button key={m.id} className={`metodo-btn ${metodoPago == m.id ? "activo" : ""}`} onClick={() => setMetodoPago(m.id)}>
                        {m.icon} {m.label}
                      </button>
                    ))}
                  </div>
                  <div className="total-row">
                    <span className="total-label">Total a cobrar</span>
                    <span className="total-valor">${fmt(total)}</span>
                  </div>
                  <button className="btn-confirmar" onClick={confirmarVenta} disabled={!clienteSeleccionado || carrito.length === 0}>
                    Confirmar venta
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ════ HISTORIAL ════ */}
          {pestana === "historial" && (
            <div className="historial-wrap">
              {cargandoHistorial ? (
                <div className="spinner">Cargando ventas de hoy...</div>
              ) : ventasHoy.length === 0 ? (
                <div className="historial-vacio"><span style={{ fontSize: 36 }}>📋</span><span>No hay ventas registradas hoy</span></div>
              ) : (
                <table className="historial-tabla">
                  <thead>
                    <tr><th>#</th><th>Cliente</th><th>Método de pago</th><th>Hora</th><th style={{ textAlign: "right" }}>Total</th></tr>
                  </thead>
                  <tbody>
                    {ventasHoy.map(v => (
                      <tr key={v.venta_id}>
                        <td style={{ color: "#aaa", fontFamily: "monospace" }}>#{v.venta_id}</td>
                        <td style={{ fontWeight: 500 }}>{v.cliente}</td>
                        <td><span className="badge-metodo">{v.metodo_pago}</span></td>
                        <td style={{ color: "#aaa" }}>{new Date(v.fecha).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}</td>
                        <td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 500, color: "#00A884" }}>${fmt(v.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ════ CAJA ════ */}
          {pestana === "caja" && (
            <div className="caja-wrap">
              {cargandoHistorial ? (
                <div className="spinner">Calculando caja...</div>
              ) : ventasHoy.length === 0 ? (
                <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:200,color:"#ccc",gap:8,fontSize:13 }}>
                  <span style={{ fontSize: 36 }}>💰</span><span>No hay movimientos hoy</span>
                </div>
              ) : (
                <>
                  <div className="caja-stats">
                    <div className="caja-stat"><div className="caja-stat-label">Total recaudado</div><div className="caja-stat-val verde">${fmt(totalDia)}</div></div>
                    <div className="caja-stat"><div className="caja-stat-label">Ventas realizadas</div><div className="caja-stat-val">{totalVentas}</div></div>
                    <div className="caja-stat"><div className="caja-stat-label">Ticket promedio</div><div className="caja-stat-val">${fmt(ticketPromedio)}</div></div>
                  </div>
                  <div className="caja-metodos">
                    <h3>Recaudo por método de pago</h3>
                    {Object.entries(porMetodo).map(([metodo, monto]) => (
                      <div key={metodo} className="metodo-row">
                        <span className="metodo-row-label">
                          {metodo === "Efectivo" ? "💵" : metodo === "Transferencia" ? "🏦" : metodo === "Nequi" ? "📱" : "💳"}
                          {metodo}
                        </span>
                        <span className="metodo-row-val">${fmt(monto)}</span>
                      </div>
                    ))}
                    <div className="metodo-row" style={{ borderTop: "1.5px solid #f0f0f0", marginTop: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>Total</span>
                      <span className="metodo-row-val" style={{ color: "#00A884" }}>${fmt(totalDia)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ════ MODAL NUEVO CLIENTE ════ */}
      {mostrarFormCliente && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setMostrarFormCliente(false)}>
          <div className="modal-box">
            <div className="modal-header">
              <h3>➕ Nuevo cliente</h3>
              <button className="modal-close" onClick={() => setMostrarFormCliente(false)}>✕</button>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label className="form-label">Nombre *</label>
                <input className="form-input" name="nombre" value={nuevoCliente.nombre} onChange={handleCampoCliente} placeholder="Nombre" autoFocus />
              </div>
              <div className="form-field">
                <label className="form-label">Apellido</label>
                <input className="form-input" name="apellido" value={nuevoCliente.apellido} onChange={handleCampoCliente} placeholder="Apellido" />
              </div>
              <div className="form-field">
                <label className="form-label">Tipo de documento</label>
                <select className="form-input" name="tipo_documento" value={nuevoCliente.tipo_documento} onChange={handleCampoCliente}>
                  {tiposDocumento.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Número de documento</label>
                <input className="form-input" name="numero_documento" value={nuevoCliente.numero_documento} onChange={handleCampoCliente} placeholder="Número" />
              </div>
              <div className="form-field">
                <label className="form-label">Teléfono</label>
                <input className="form-input" name="telefono" value={nuevoCliente.telefono} onChange={handleCampoCliente} placeholder="Teléfono" />
              </div>
              <div className="form-field">
                <label className="form-label">Dirección</label>
                <input className="form-input" name="direccion" value={nuevoCliente.direccion} onChange={handleCampoCliente} placeholder="Dirección" />
              </div>

              {/* ── Departamento (desde backend) ── */}
              <div className="form-field">
                <label className="form-label">Departamento</label>
                <select className="form-input" name="id_departamento" value={nuevoCliente.id_departamento} onChange={handleCampoCliente}>
                  <option value="">Seleccionar...</option>
                  {departamentos.map(d => (
                    <option key={d.id} value={d.id}>{d.nombre}</option>
                  ))}
                </select>
              </div>

              {/* ── Municipio (desde backend, depende del departamento) ── */}
              <div className="form-field">
                <label className="form-label">Municipio</label>
                <select
                  className="form-input"
                  name="id_municipio"
                  value={nuevoCliente.id_municipio}
                  onChange={handleCampoCliente}
                  disabled={!nuevoCliente.id_departamento}
                >
                  <option value="">
                    {nuevoCliente.id_departamento ? "Seleccionar..." : "Primero elige departamento"}
                  </option>
                  {municipios.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancelar" onClick={() => setMostrarFormCliente(false)}>Cancelar</button>
              <button className="btn-guardar" onClick={handleCrearCliente} disabled={creandoCliente || !nuevoCliente.nombre.trim()}>
                {creandoCliente ? "Guardando..." : "Guardar y seleccionar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {ventaExitosa && (
        <div className="toast">
          <span style={{ fontSize: 18 }}>✅</span>
          <div>
            <strong>Venta registrada</strong>
            <div style={{ fontSize: 12, opacity: 0.7 }}>ID #{ventaExitosa.venta_id} · ${fmt(ventaExitosa.total)}</div>
          </div>
        </div>
      )}
    </>
  );
}
