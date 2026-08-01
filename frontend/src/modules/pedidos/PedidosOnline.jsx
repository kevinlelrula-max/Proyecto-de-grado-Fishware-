import { useState, useEffect } from "react";
import { usePedidosAdmin, ESTADOS } from "./hooks/usePedidosAdmin";
import PedidoCardAdmin from "./components/PedidoCardAdmin";
import EnvioConfig from "../envio/EnvioConfig";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const TABS = [
  { key: "pedidos",    label: "📦 Pedidos" },
  { key: "abandonados",label: "🛒 Carritos abandonados" },
  { key: "envio",      label: "🚚 Configuración de envío" },
];

function tiempoTranscurrido(fecha) {
  const mins = Math.floor((Date.now() - new Date(fecha)) / 60000);
  if (mins < 60)   return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)    return `Hace ${hrs} h`;
  return `Hace ${Math.floor(hrs / 24)} días`;
}

function TabCarritosAbandonados() {
  const token = localStorage.getItem("token");
  const [carritos,  setCarritos]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [expandido, setExpandido] = useState(null);
  const [horas,     setHoras]     = useState(2);

  const cargar = () => {
    if (!token) return;
    setLoading(true);
    fetch(`${BASE_URL}/api/carritos/abandonados?horas=${horas}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : [])
      .then(data => { setCarritos(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, [horas]);

  const fmt = n => `$${parseFloat(n||0).toLocaleString("es-CO")}`;

  if (loading) return <div style={{ padding:40,textAlign:"center",color:"#94a3b8" }}>Cargando carritos...</div>;

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:16 }}>

      {/* Header + filtro */}
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12 }}>
        <div>
          <h3 style={{ fontSize:16,fontWeight:700,color:"#0f172a",margin:0 }}>Carritos abandonados</h3>
          <p style={{ fontSize:13,color:"#94a3b8",margin:"3px 0 0" }}>
            Clientes que agregaron productos pero no completaron el pedido
          </p>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <span style={{ fontSize:13,color:"#64748b" }}>Inactivos por más de</span>
          <select value={horas} onChange={e => setHoras(Number(e.target.value))}
            style={{ padding:"6px 10px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:13,color:"#0f172a",background:"#fff",cursor:"pointer" }}>
            <option value={1}>1 hora</option>
            <option value={2}>2 horas</option>
            <option value={6}>6 horas</option>
            <option value={24}>24 horas</option>
          </select>
          <button onClick={cargar} style={{ padding:"6px 14px",background:"#2563eb",color:"#fff",border:"none",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer" }}>
            Actualizar
          </button>
        </div>
      </div>

      {carritos.length === 0 ? (
        <div style={{ textAlign:"center",padding:"60px 0",color:"#94a3b8" }}>
          <div style={{ fontSize:48,marginBottom:12 }}>🎉</div>
          <p style={{ fontSize:15,fontWeight:600,color:"#64748b",margin:0 }}>No hay carritos abandonados</p>
          <p style={{ fontSize:13,margin:"6px 0 0" }}>Todos los clientes completaron sus pedidos en las últimas {horas}h</p>
        </div>
      ) : (
        <>
          {/* Resumen */}
          <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12 }}>
            {[
              { label:"Carritos", value: carritos.length, icon:"🛒", color:"#f59e0b" },
              { label:"Valor potencial", value: fmt(carritos.reduce((a,c)=>a+parseFloat(c.total||0),0)), icon:"💰", color:"#10b981" },
              { label:"Productos no vendidos", value: carritos.reduce((a,c)=>a+(c.items?.length||0),0), icon:"📦", color:"#6366f1" },
            ].map(k => (
              <div key={k.label} style={{ background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",padding:"14px 18px",display:"flex",alignItems:"center",gap:12 }}>
                <span style={{ fontSize:24 }}>{k.icon}</span>
                <div>
                  <p style={{ fontSize:11,color:"#94a3b8",margin:0,textTransform:"uppercase",letterSpacing:"0.05em",fontWeight:600 }}>{k.label}</p>
                  <p style={{ fontSize:20,fontWeight:800,color:"#0f172a",margin:"2px 0 0" }}>{k.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Lista */}
          <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
            {carritos.map(c => (
              <div key={c.id} style={{ background:"#fff",borderRadius:14,border:"1px solid #e2e8f0",overflow:"hidden" }}>
                {/* Fila principal */}
                <div style={{ display:"flex",alignItems:"center",gap:14,padding:"14px 18px",cursor:"pointer" }}
                  onClick={() => setExpandido(expandido===c.id?null:c.id)}>
                  <div style={{ width:40,height:40,borderRadius:"50%",background:"#fef3c7",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>
                    {(c.cliente_nombre||"?")[0].toUpperCase()}
                  </div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <p style={{ fontSize:14,fontWeight:700,color:"#0f172a",margin:0 }}>{c.cliente_nombre||"Cliente desconocido"}</p>
                    <p style={{ fontSize:12,color:"#94a3b8",margin:"2px 0 0" }}>
                      {c.cliente_email || c.cliente_telefono || "Sin contacto"} · {tiempoTranscurrido(c.ultima_actividad)}
                    </p>
                  </div>
                  <div style={{ textAlign:"right",flexShrink:0 }}>
                    <p style={{ fontSize:16,fontWeight:800,color:"#0f172a",margin:0 }}>{fmt(c.total)}</p>
                    <p style={{ fontSize:11,color:"#94a3b8",margin:"2px 0 0" }}>{c.items?.length||0} producto{c.items?.length!==1?"s":""}</p>
                  </div>
                  <span style={{ fontSize:18,color:"#94a3b8",marginLeft:4,flexShrink:0 }}>{expandido===c.id?"▲":"▼"}</span>
                </div>

                {/* Detalle expandible */}
                {expandido===c.id && (
                  <div style={{ borderTop:"1px solid #f1f5f9",padding:"14px 18px",background:"#fafafa" }}>
                    <div style={{ display:"flex",flexDirection:"column",gap:8,marginBottom:14 }}>
                      {(c.items||[]).map((item,i) => (
                        <div key={i} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:13 }}>
                          <span style={{ color:"#334155" }}>📦 {item.nombre} × {item.cantidad}</span>
                          <span style={{ fontWeight:700,color:"#0f172a" }}>{fmt(item.precio*item.cantidad)}</span>
                        </div>
                      ))}
                    </div>
                    {(c.cliente_telefono || c.cliente_email) && (
                      <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                        {c.cliente_telefono && (
                          <a href={`https://wa.me/57${c.cliente_telefono.replace(/\D/g,"")}?text=${encodeURIComponent(`Hola ${c.cliente_nombre||""}, vimos que dejaste productos en tu carrito. ¿Te podemos ayudar a completar tu pedido?`)}`}
                            target="_blank" rel="noreferrer"
                            style={{ padding:"8px 16px",background:"#25d366",color:"#fff",borderRadius:9,fontSize:13,fontWeight:700,textDecoration:"none",display:"flex",alignItems:"center",gap:6 }}>
                            💬 Contactar por WhatsApp
                          </a>
                        )}
                        {c.cliente_email && (
                          <a href={`mailto:${c.cliente_email}?subject=Tu carrito te espera&body=Hola ${c.cliente_nombre||""}, tienes productos esperándote en tu carrito.`}
                            style={{ padding:"8px 16px",background:"#f1f5f9",color:"#374151",borderRadius:9,fontSize:13,fontWeight:600,textDecoration:"none",border:"1px solid #e2e8f0" }}>
                            ✉️ Enviar email
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function PedidosOnline() {
  const { pedidos, loading, error, cambiando, conteos, fetchPedidos, cambiarEstado, notifPermiso, pedirPermiso } = usePedidosAdmin();
  const [filtro,    setFiltro]    = useState("todos");
  const [busqueda,  setBusqueda]  = useState("");
  const [tabActiva, setTabActiva] = useState("pedidos");

  const pedidosFiltrados = pedidos
    .filter(p => filtro === "todos" || p.estado === filtro)
    .filter(p => {
      if (!busqueda) return true;
      const q = busqueda.toLowerCase();
      return (
        String(p.id).includes(q) ||
        p.cliente_nombre?.toLowerCase().includes(q) ||
        p.cliente_apellido?.toLowerCase().includes(q)
      );
    });

  return (
    <div style={s.wrap} className="pedidos-wrap">
      <style>{`
        @media (max-width: 768px) {
          .pedidos-wrap { padding: 16px !important; }
          .pedidos-header { flex-wrap: wrap !important; gap: 10px !important; }
          .pedidos-notif { flex-wrap: wrap !important; }
        }
      `}</style>

      {/* ── HEADER ── */}
      <div style={s.header} className="pedidos-header">
        <div>
          <h1 style={s.title}>Pedidos online</h1>
          <p style={s.subtitle}>
            {pedidos.length} pedido{pedidos.length !== 1 ? "s" : ""} en total
            · Actualización automática cada 30 seg
          </p>
        </div>
        {tabActiva === "pedidos" && (
          <button style={s.refetchBtn} onClick={fetchPedidos}>
            🔄 Actualizar
          </button>
        )}
      </div>

      {notifPermiso !== "granted" && (
        <div style={s.notifBanner} className="pedidos-notif">
          <span style={s.notifText}>
            🔔 Activa las notificaciones para recibir alertas cuando llegue un nuevo pedido
          </span>
          <button
            onClick={pedirPermiso}
            style={{ ...s.notifBtn, ...(notifPermiso === "denied" ? s.notifBtnBloq : {}) }}
            disabled={notifPermiso === "denied"}
          >
            {notifPermiso === "denied" ? "Bloqueadas en el navegador" : "Activar notificaciones"}
          </button>
        </div>
      )}

      {/* 3️⃣ TABS */}
      <div style={s.tabs}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            style={{
              ...s.tabBtn,
              ...(tabActiva === tab.key ? s.tabBtnActive : {}),
            }}
            onClick={() => setTabActiva(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── CONTENIDO SEGÚN TAB ── */}
      {tabActiva === "abandonados" ? (
        <TabCarritosAbandonados />
      ) : tabActiva === "envio" ? (
        <EnvioConfig />
      ) : (
        <>
          {/* ── FILTROS ── */}
          <div style={s.filtros}>
            <button
              style={{ ...s.filtroBtn, ...(filtro === "todos" ? s.filtroBtnActive : {}) }}
              onClick={() => setFiltro("todos")}
            >
              Todos <span style={s.filtroCount}>{pedidos.length}</span>
            </button>
            {ESTADOS.map(e => (
              <button
                key={e.key}
                style={{
                  ...s.filtroBtn,
                  ...(filtro === e.key
                    ? { ...s.filtroBtnActive, borderColor: e.color, color: e.color, backgroundColor: e.bg }
                    : {}),
                }}
                onClick={() => setFiltro(e.key)}
              >
                {e.label}
                {conteos[e.key] > 0 && (
                  <span style={{ ...s.filtroCount, backgroundColor: e.color, color: "white" }}>
                    {conteos[e.key]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── BUSCADOR ── */}
          <div style={s.buscadorWrap}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="9" cy="9" r="6"/><path d="M15 15l3 3"/>
            </svg>
            <input
              style={s.buscador}
              placeholder="Buscar por # pedido o cliente..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
            {busqueda && (
              <button style={s.clearBtn} onClick={() => setBusqueda("")}>✕</button>
            )}
          </div>

          {/* ── LISTA ── */}
          {loading ? (
            <div style={s.skeletonWrap}>
              {[1, 2, 3].map(i => <div key={i} style={s.skeleton} />)}
            </div>
          ) : error ? (
            <div style={s.errorBox}>⚠️ {error}</div>
          ) : pedidosFiltrados.length === 0 ? (
            <div style={s.empty}>
              <span style={{ fontSize: "40px" }}>📦</span>
              <p>No hay pedidos{filtro !== "todos" ? ` con estado "${ESTADOS.find(e => e.key === filtro)?.label}"` : ""}</p>
            </div>
          ) : (
            <div style={s.lista}>
              {pedidosFiltrados.map(pedido => (
                <PedidoCardAdmin
                  key={pedido.id}
                  pedido={pedido}
                  cambiando={cambiando}
                  onCambiarEstado={cambiarEstado}
                />
              ))}
            </div>
          )}
        </>
      )}

    </div>
  );
}

const s = {
  wrap: { padding: "28px", fontFamily: "'Inter', 'Segoe UI', sans-serif", width: "100%" },
  header:        { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" },
  title:         { fontSize: "22px", fontWeight: "800", color: "#0f172a", marginBottom: "4px" },
  subtitle:      { fontSize: "13px", color: "#64748b" },
  refetchBtn:    { padding: "8px 16px", backgroundColor: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: "9px", fontSize: "13px", cursor: "pointer", fontWeight: "500", color: "#374151" },

  // Tabs
  tabs:          { display: "flex", gap: "4px", marginBottom: "24px", borderBottom: "2px solid #e2e8f0", paddingBottom: "0" },
  tabBtn:        { padding: "8px 18px", border: "none", background: "none", fontSize: "13px", fontWeight: "600", color: "#94a3b8", cursor: "pointer", borderBottom: "2px solid transparent", marginBottom: "-2px", borderRadius: "0", transition: "all 0.15s" },
  tabBtnActive:  { color: "#2563eb", borderBottom: "2px solid #2563eb" },

  filtros:       { display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" },
  filtroBtn:     { display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "999px", border: "1.5px solid #e2e8f0", backgroundColor: "white", fontSize: "12px", fontWeight: "600", color: "#64748b", cursor: "pointer", transition: "all 0.15s" },
  filtroBtnActive: { borderColor: "#2563eb", color: "#2563eb", backgroundColor: "#eff6ff" },
  filtroCount:   { backgroundColor: "#e2e8f0", color: "#64748b", fontSize: "10px", fontWeight: "700", padding: "1px 6px", borderRadius: "999px" },
  buscadorWrap:  { display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", backgroundColor: "white", border: "1.5px solid #e2e8f0", borderRadius: "10px", marginBottom: "20px" },
  buscador:      { flex: 1, border: "none", outline: "none", fontSize: "13px", color: "#0f172a", background: "none" },
  clearBtn:      { background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "12px" },
  skeletonWrap:  { display: "flex", flexDirection: "column", gap: "10px" },
  skeleton:      { height: "72px", borderRadius: "14px", backgroundColor: "#e2e8f0" },
  empty:         { textAlign: "center", padding: "60px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", color: "#64748b", fontSize: "14px" },
  errorBox:      { backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "12px 16px", fontSize: "13px", color: "#b91c1c" },
  lista:         { display: "flex", flexDirection: "column", gap: "10px" },
  notifBanner:   { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "10px 16px", backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "10px", marginBottom: "16px" },
  notifText:     { fontSize: "13px", color: "#92400e", flex: 1 },
  notifBtn:      { flexShrink: 0, padding: "6px 14px", backgroundColor: "#f59e0b", color: "white", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: "600", cursor: "pointer" },
  notifBtnBloq:  { backgroundColor: "#e2e8f0", color: "#94a3b8", cursor: "not-allowed" },
};