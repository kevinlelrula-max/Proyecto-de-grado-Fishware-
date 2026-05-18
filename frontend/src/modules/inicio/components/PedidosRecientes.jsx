const ESTADOS = {
  pendiente:      { label: "Pendiente",  color: "#f59e0b", bg: "#fffbeb" },
  confirmado:     { label: "Confirmado", color: "#3b82f6", bg: "#eff6ff" },
  en_preparacion: { label: "Preparando", color: "#8b5cf6", bg: "#f5f3ff" },
  enviado:        { label: "Enviado",    color: "#0e7490", bg: "#ecfeff" },
  entregado:      { label: "Entregado",  color: "#0F6E56", bg: "#E1F5EE" },
  cancelado:      { label: "Cancelado",  color: "#ef4444", bg: "#fef2f2" },
};

export default function PedidosRecientes({ pedidos, onIrA }) {
  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div>
          <h3 style={s.title}>Últimos pedidos online</h3>
          <p style={s.subtitle}>Pedidos recibidos por tu tienda</p>
        </div>
        <button style={s.verTodos} onClick={() => onIrA("ventas")}>
          Ver todos →
        </button>
      </div>

      {!pedidos || pedidos.length === 0 ? (
        <div style={s.empty}>
          <span style={s.emptyIcon}>📭</span>
          <p style={s.emptyTitle}>Aún no tienes pedidos</p>
          <p style={s.emptyDesc}>Cuando tus clientes compren aparecerán aquí</p>
        </div>
      ) : (
        <div style={s.list}>
          {pedidos.map((pedido) => {
            const estado = ESTADOS[pedido.estado] || ESTADOS.pendiente;
            const fecha  = new Date(pedido.fecha_pedido).toLocaleDateString("es-CO", {
              day: "numeric", month: "short",
              hour: "2-digit", minute: "2-digit",
            });
            return (
              <div key={pedido.id} style={s.item}>
                <div style={s.itemAvatar}>
                  {pedido.nombre?.charAt(0).toUpperCase()}
                </div>
                <div style={s.itemInfo}>
                  <p style={s.itemNombre}>{pedido.nombre} {pedido.apellido}</p>
                  <p style={s.itemFecha}>{fecha}</p>
                </div>
                <div style={s.itemRight}>
                  <span style={{ ...s.badge, backgroundColor: estado.bg, color: estado.color }}>
                    {estado.label}
                  </span>
                  <p style={s.itemTotal}>${Number(pedido.total).toLocaleString("es-CO")}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const s = {
  wrap: {
    backgroundColor: "white",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 24px",
    borderBottom: "1px solid #f1f5f9",
  },
  title: { fontSize: "15px", fontWeight: "700", color: "#0f172a" },
  subtitle: { fontSize: "12px", color: "#94a3b8", marginTop: "2px" },
  verTodos: {
    background: "none", border: "none",
    color: "#00C9A7", fontSize: "13px",
    fontWeight: "600", cursor: "pointer",
  },
  empty: {
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: "8px",
    padding: "40px 24px", textAlign: "center",
  },
  emptyIcon: { fontSize: "36px" },
  emptyTitle: { fontSize: "14px", fontWeight: "600", color: "#64748b" },
  emptyDesc: { fontSize: "12px", color: "#94a3b8" },
  list: { display: "flex", flexDirection: "column" },
  item: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "14px 24px",
    borderBottom: "1px solid #f8fafc",
    transition: "background 0.15s",
  },
  itemAvatar: {
    width: "36px", height: "36px",
    borderRadius: "10px",
    backgroundColor: "#E1F5EE",
    color: "#0F6E56",
    fontSize: "14px", fontWeight: "700",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  itemInfo: { flex: 1 },
  itemNombre: { fontSize: "13px", fontWeight: "600", color: "#0f172a" },
  itemFecha: { fontSize: "11px", color: "#94a3b8", marginTop: "2px" },
  itemRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" },
  badge: {
    padding: "2px 8px", borderRadius: "999px",
    fontSize: "11px", fontWeight: "600",
  },
  itemTotal: { fontSize: "14px", fontWeight: "700", color: "#0f172a" },
};