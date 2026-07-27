import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

function fmt(n) { return Number(n || 0).toLocaleString("es-CO"); }
function fmtFecha(f) {
  if (!f) return "—";
  return new Date(f).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
}

// Color del badge según nombre del nivel
function nivelColor(nombre = "") {
  const n = nombre.toLowerCase();
  if (n.includes("platino") || n.includes("diamante")) return { bg: "#f0f9ff", color: "#0369a1", border: "#bae6fd" };
  if (n.includes("oro")     || n.includes("gold"))     return { bg: "#fffbeb", color: "#b45309", border: "#fde68a" };
  if (n.includes("plata")   || n.includes("silver"))   return { bg: "#f1f5f9", color: "#475569", border: "#cbd5e1" };
  return { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" };
}

export default function Vista360({ clienteId, onCerrar }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger slide-in animation
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API}/api/clientes/${clienteId}/vista360`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError("No se pudo cargar la información."); setLoading(false); });
  }, [clienteId]);

  const handleCerrar = () => {
    setVisible(false);
    setTimeout(onCerrar, 280);
  };

  // Mini barra POS vs Online
  const totalOps = data ? (data.compras.pos.total_ventas + data.compras.online.total_pedidos) : 0;
  const pctPos    = totalOps > 0 ? Math.round((data.compras.pos.total_ventas    / totalOps) * 100) : 0;
  const pctOnline = totalOps > 0 ? Math.round((data.compras.online.total_pedidos / totalOps) * 100) : 0;

  return (
    <>
      <div style={s.overlay} onClick={handleCerrar} />
      <div style={{ ...s.drawer, transform: visible ? "translateX(0)" : "translateX(100%)" }}>

        {/* ── HEADER ── */}
        <div style={s.header}>
          <div style={s.headerLeft}>
            <div style={s.avatarWrap}>
              <div style={s.avatar}>
                {data ? `${data.cliente.nombre[0]}${data.cliente.apellido?.[0] || ""}` : "…"}
              </div>
              {data?.lealtad.nivel_actual && (
                <div style={{ ...s.avatarBadge, ...nivelColor(data.lealtad.nivel_actual.nombre) }}>
                  {data.lealtad.nivel_actual.nombre}
                </div>
              )}
            </div>
            <div>
              <h2 style={s.nombre}>
                {data ? `${data.cliente.nombre} ${data.cliente.apellido || ""}` : "Cargando..."}
              </h2>
              <p style={s.sub}>{data?.cliente.usuario || ""}</p>
              {data?.cliente.telefono && (
                <p style={s.subPhone}>📞 {data.cliente.telefono}</p>
              )}
            </div>
          </div>
          <button style={s.closeBtn} onClick={handleCerrar}>✕</button>
        </div>

        {loading && (
          <div style={s.loading}>
            <div style={s.loadingDot} />
            Cargando vista 360...
          </div>
        )}
        {error && <div style={s.errorBox}>⚠️ {error}</div>}

        {data && (
          <div style={s.body}>

            {/* ── BLOQUE 1: KPIs ── */}
            <div style={s.kpiGrid}>
              <div style={{ ...s.kpi, borderTop: "3px solid #0F6E56" }}>
                <span style={s.kpiIcon}>💰</span>
                <span style={{ ...s.kpiVal, color: "#0F6E56" }}>${fmt(data.compras.total_gastado)}</span>
                <span style={s.kpiLabel}>Total gastado</span>
              </div>
              <div style={{ ...s.kpi, borderTop: "3px solid #6366f1" }}>
                <span style={s.kpiIcon}>🧾</span>
                <span style={s.kpiVal}>{data.compras.pos.total_ventas + data.compras.online.total_pedidos}</span>
                <span style={s.kpiLabel}>Compras totales</span>
              </div>
              <div style={{ ...s.kpi, borderTop: "3px solid #f59e0b" }}>
                <span style={s.kpiIcon}>📊</span>
                <span style={s.kpiVal}>${fmt(data.compras.ticket_promedio)}</span>
                <span style={s.kpiLabel}>Ticket promedio</span>
              </div>
              <div style={{ ...s.kpi, borderTop: "3px solid #3b82f6" }}>
                <span style={s.kpiIcon}>{data.compras.canal_preferido === "POS" ? "🏪" : "💻"}</span>
                <span style={s.kpiVal}>{data.compras.canal_preferido}</span>
                <span style={s.kpiLabel}>Canal preferido</span>
              </div>
            </div>

            {/* ── BLOQUE 2: Comportamiento de compra ── */}
            <div style={s.card}>
              <h4 style={s.cardTitle}>🛒 Comportamiento de compra</h4>

              {/* Mini barra comparativa */}
              {totalOps > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={s.splitBarWrap}>
                    <div style={{ ...s.splitBarPos, width: `${pctPos}%` }} title={`POS ${pctPos}%`} />
                    <div style={{ ...s.splitBarOnline, width: `${pctOnline}%` }} title={`Online ${pctOnline}%`} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                    <span style={s.splitLabel}><span style={s.dotPos} />POS {pctPos}%</span>
                    <span style={s.splitLabel}><span style={s.dotOnline} />Online {pctOnline}%</span>
                  </div>
                </div>
              )}

              <div style={s.dobleCol}>
                <div style={s.canalBox}>
                  <p style={s.canalTitulo}>🏪 Punto de venta</p>
                  <p style={s.canalVal}>{data.compras.pos.total_ventas} compras</p>
                  <p style={s.canalSub}>${fmt(data.compras.pos.total_gastado)} total</p>
                  <p style={s.canalSub}>Última: {fmtFecha(data.compras.pos.ultima_compra)}</p>
                </div>
                <div style={s.canalBox}>
                  <p style={s.canalTitulo}>💻 Tienda online</p>
                  <p style={s.canalVal}>{data.compras.online.total_pedidos} pedidos</p>
                  <p style={s.canalSub}>${fmt(data.compras.online.total_gastado)} total</p>
                  <p style={s.canalSub}>Último: {fmtFecha(data.compras.online.ultimo_pedido)}</p>
                </div>
              </div>

            </div>

            {/* ── BLOQUE 2b: Top productos (card propia) ── */}
            {data.compras.top_productos.length > 0 && (
              <div style={s.card}>
                <h4 style={s.cardTitle}>📦 Productos más comprados</h4>
                {data.compras.top_productos.map((p, i) => (
                  <div key={i} style={s.prodRow}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ ...s.prodRank, background: i === 0 ? "#fef9c3" : "#f1f5f9", color: i === 0 ? "#854d0e" : "#64748b" }}>
                        {i + 1}
                      </span>
                      <span style={s.prodNombre}>{p.nombre}</span>
                    </div>
                    <span style={s.prodVal}>{Number(p.total_cantidad).toFixed(1)} {p.unidad || "uds."} · ${fmt(p.total_gastado)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* ── BLOQUE 3: Lealtad ── */}
            <div style={s.card}>
              <h4 style={s.cardTitle}>🏆 Nivel de lealtad</h4>
              {data.lealtad.nivel_actual ? (() => {
                const nc = nivelColor(data.lealtad.nivel_actual.nombre);
                return (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <div style={{ ...s.nivelBadge, background: nc.bg, color: nc.color, border: `1px solid ${nc.border}` }}>
                      {data.lealtad.nivel_actual.nombre}
                    </div>
                    <span style={{ fontSize: 13, color: "#64748b" }}>
                      {data.lealtad.nivel_actual.descuento_porcentaje}% de descuento activo
                    </span>
                  </div>
                );
              })() : (
                <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 14 }}>Sin nivel este mes</p>
              )}

              {data.lealtad.proximo_nivel && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: "#64748b" }}>
                      ${fmt(data.lealtad.total_mes)} este mes
                    </span>
                    <span style={{ fontSize: 11, color: "#64748b" }}>
                      Próximo: <strong>{data.lealtad.proximo_nivel.nombre}</strong> (${fmt(data.lealtad.proximo_nivel.monto_minimo)})
                    </span>
                  </div>
                  <div style={s.barTrack}>
                    <div style={{
                      ...s.barFill,
                      width: `${Math.min(100, (data.lealtad.total_mes / data.lealtad.proximo_nivel.monto_minimo) * 100)}%`,
                    }} />
                  </div>
                  <p style={{ fontSize: 11, color: "#0F6E56", marginTop: 5, fontWeight: 600 }}>
                    Le faltan ${fmt(data.lealtad.falta_para_subir)} para subir de nivel
                  </p>
                </div>
              )}
            </div>

            {/* ── BLOQUE 4: Referidos ── */}
            <div style={s.card}>
              <h4 style={s.cardTitle}>🔗 Referidos</h4>
              <div style={s.refGrid}>
                <div style={s.refStat}>
                  <span style={s.refVal}>{data.referidos.total}</span>
                  <span style={s.refLabel}>Total</span>
                </div>
                <div style={{ ...s.refStat, borderTop: "2px solid #0F6E56" }}>
                  <span style={{ ...s.refVal, color: "#0F6E56" }}>{data.referidos.completados}</span>
                  <span style={s.refLabel}>Completados</span>
                </div>
                <div style={{ ...s.refStat, borderTop: "2px solid #f59e0b" }}>
                  <span style={{ ...s.refVal, color: "#f59e0b" }}>{data.referidos.pendientes}</span>
                  <span style={s.refLabel}>Pendientes</span>
                </div>
              </div>
            </div>

            {/* ── BLOQUE 5: Cupones ── */}
            {data.cupones.length > 0 && (
              <div style={s.card}>
                <h4 style={s.cardTitle}>🎫 Cupones usados</h4>
                {data.cupones.map((c, i) => (
                  <div key={i} style={s.cuponRow}>
                    <span style={s.cuponCodigo}>{c.codigo}</span>
                    <span style={s.cuponDesc}>
                      {c.descuento_tipo === "porcentaje"
                        ? `${c.descuento_valor}% OFF`
                        : `$${fmt(c.descuento_valor)} OFF`}
                    </span>
                    <span style={s.cuponFecha}>{fmtFecha(c.fecha_uso)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* ── BLOQUE 6: Reseñas ── */}
            {data.reseñas.length > 0 && (
              <div style={s.card}>
                <h4 style={s.cardTitle}>⭐ Reseñas</h4>
                {data.reseñas.map((r, i) => (
                  <div key={i} style={s.reseñaRow}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>{r.producto}</span>
                      <div style={{ display: "flex", gap: 1 }}>
                        {[1,2,3,4,5].map(n => (
                          <span key={n} style={{ fontSize: 12, color: n <= r.estrellas ? "#f59e0b" : "#e2e8f0" }}>★</span>
                        ))}
                      </div>
                    </div>
                    {r.comentario && (
                      <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0" }}>{r.comentario}</p>
                    )}
                    <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>{fmtFecha(r.creado_en)}</p>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}
      </div>
    </>
  );
}

const s = {
  overlay:    { position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.45)", zIndex: 400, backdropFilter: "blur(3px)" },
  drawer:     { position: "fixed", top: 0, right: 0, bottom: 0, width: "540px", backgroundColor: "#f8fafc", zIndex: 401, display: "flex", flexDirection: "column", boxShadow: "-12px 0 48px rgba(0,0,0,0.18)", fontFamily: "'Inter','Segoe UI',sans-serif", transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)" },

  // Header
  header:     { padding: "20px 24px", background: "linear-gradient(135deg,#ffffff 60%,#f0fdf4)", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 },
  headerLeft: { display: "flex", alignItems: "center", gap: 14 },
  avatarWrap: { position: "relative", flexShrink: 0 },
  avatar:     { width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,#0F6E56,#10b981)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 800, boxShadow: "0 2px 8px rgba(15,110,86,0.3)" },
  avatarBadge:{ position: "absolute", bottom: -4, left: "50%", transform: "translateX(-50%)", fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 999, border: "1px solid", whiteSpace: "nowrap" },
  nombre:     { fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 },
  sub:        { fontSize: 12, color: "#94a3b8", margin: "2px 0 0" },
  subPhone:   { fontSize: 11, color: "#64748b", margin: "2px 0 0" },
  closeBtn:   { background: "none", border: "1px solid #e2e8f0", borderRadius: 8, width: 32, height: 32, fontSize: 14, cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center" },

  body:       { flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 },
  loading:    { padding: 48, textAlign: "center", color: "#94a3b8", fontSize: 13, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 },
  loadingDot: { width: 32, height: 32, borderRadius: "50%", border: "3px solid #e2e8f0", borderTopColor: "#0F6E56", animation: "spin 0.8s linear infinite" },
  errorBox:   { margin: 20, padding: "12px 16px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, fontSize: 13, color: "#b91c1c" },

  // KPIs
  kpiGrid:    { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 },
  kpi:        { backgroundColor: "white", borderRadius: 12, border: "1px solid #e2e8f0", padding: "16px 10px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textAlign: "center" },
  kpiIcon:    { fontSize: 20 },
  kpiVal:     { fontSize: 15, fontWeight: 800, color: "#0f172a" },
  kpiLabel:   { fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" },

  // Cards
  card:       { backgroundColor: "white", borderRadius: 14, border: "1px solid #e2e8f0", padding: "20px 22px" },
  cardTitle:  { fontSize: 13, fontWeight: 700, color: "#0f172a", margin: "0 0 12px" },
  subTitle:   { fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 8px" },

  // Barra POS vs Online
  splitBarWrap:   { display: "flex", height: 8, borderRadius: 999, overflow: "hidden", backgroundColor: "#f1f5f9" },
  splitBarPos:    { backgroundColor: "#0F6E56", transition: "width 0.6s" },
  splitBarOnline: { backgroundColor: "#6366f1", transition: "width 0.6s" },
  splitLabel:     { fontSize: 11, color: "#64748b", display: "flex", alignItems: "center", gap: 4 },
  dotPos:         { display: "inline-block", width: 8, height: 8, borderRadius: "50%", backgroundColor: "#0F6E56" },
  dotOnline:      { display: "inline-block", width: 8, height: 8, borderRadius: "50%", backgroundColor: "#6366f1" },

  // Canal
  dobleCol:    { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  canalBox:    { backgroundColor: "#f8fafc", borderRadius: 10, padding: "12px 14px" },
  canalTitulo: { fontSize: 12, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" },
  canalVal:    { fontSize: 15, fontWeight: 800, color: "#0F6E56", margin: "0 0 2px" },
  canalSub:    { fontSize: 11, color: "#94a3b8", margin: 0 },

  // Productos
  prodRow:    { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #f1f5f9" },
  prodRank:   { width: 20, height: 20, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 },
  prodNombre: { fontSize: 12, color: "#0f172a" },
  prodVal:    { fontSize: 12, fontWeight: 600, color: "#64748b" },

  // Lealtad
  nivelBadge: { padding: "5px 14px", borderRadius: 999, fontSize: 13, fontWeight: 700 },
  barTrack:   { height: 8, backgroundColor: "#e2e8f0", borderRadius: 999, overflow: "hidden" },
  barFill:    { height: "100%", backgroundColor: "#0F6E56", borderRadius: 999, transition: "width 0.6s ease" },

  // Referidos
  refGrid:    { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 },
  refStat:    { backgroundColor: "#f8fafc", borderRadius: 10, padding: "10px", textAlign: "center", borderTop: "2px solid transparent" },
  refVal:     { display: "block", fontSize: 22, fontWeight: 800, color: "#0f172a" },
  refLabel:   { fontSize: 11, color: "#94a3b8" },

  // Cupones
  cuponRow:    { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid #f1f5f9" },
  cuponCodigo: { fontSize: 12, fontWeight: 700, color: "#0f172a", fontFamily: "monospace" },
  cuponDesc:   { fontSize: 12, fontWeight: 600, color: "#0F6E56" },
  cuponFecha:  { fontSize: 11, color: "#94a3b8" },

  // Reseñas
  reseñaRow: { padding: "8px 0", borderBottom: "1px solid #f1f5f9" },
};
