import { useState, useEffect, useCallback } from "react";
import { getReseñasEmpresa, toggleReseña, eliminarReseña } from "./services/reseñasService";
import Estrellas from "./components/Estrellas";

export default function Reseñas() {
  const [reseñas,  setReseñas]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filtro,   setFiltro]   = useState("todas"); // todas | visibles | ocultas
  const token = localStorage.getItem("token");

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getReseñasEmpresa(token);
      setReseñas(data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { cargar(); }, [cargar]);

  const handleToggle = async (id) => {
    await toggleReseña(id, token);
    setReseñas(prev => prev.map(r => r.id === id ? { ...r, activo: !r.activo } : r));
  };

  const handleEliminar = async (id) => {
    if (!confirm("¿Eliminar esta reseña permanentemente?")) return;
    await eliminarReseña(id, token);
    setReseñas(prev => prev.filter(r => r.id !== id));
  };

  const filtradas = reseñas.filter(r => {
    if (filtro === "visibles") return r.activo;
    if (filtro === "ocultas")  return !r.activo;
    return true;
  });

  const totalActivas  = reseñas.filter(r => r.activo).length;
  const promedio = reseñas.filter(r => r.activo).length > 0
    ? (reseñas.filter(r => r.activo).reduce((a, r) => a + r.calificacion, 0) / totalActivas).toFixed(1)
    : "—";

  if (loading) return <div style={s.loading}>Cargando reseñas...</div>;

  return (
    <div style={s.page}>

      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <span style={{ fontSize: "22px" }}>⭐</span>
          <h2 style={s.title}>Reseñas de clientes</h2>
        </div>
      </div>

      {/* Stats */}
      <div style={s.statsRow}>
        <div style={s.statCard}>
          <span style={s.statLabel}>Total reseñas</span>
          <span style={{ ...s.statValue, color: "#2563eb" }}>{reseñas.length}</span>
        </div>
        <div style={s.statCard}>
          <span style={s.statLabel}>Calificación promedio</span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ ...s.statValue, color: "#f59e0b" }}>{promedio}</span>
            {promedio !== "—" && <Estrellas valor={Math.round(parseFloat(promedio))} tamaño="md" />}
          </div>
        </div>
        <div style={s.statCard}>
          <span style={s.statLabel}>Reseñas visibles</span>
          <span style={{ ...s.statValue, color: "#0F6E56" }}>{totalActivas}</span>
        </div>
        <div style={s.statCard}>
          <span style={s.statLabel}>Reseñas ocultas</span>
          <span style={{ ...s.statValue, color: "#64748b" }}>{reseñas.length - totalActivas}</span>
        </div>
      </div>

      {/* Filtros */}
      <div style={s.filtros}>
        {[
          { key: "todas",    label: `Todas (${reseñas.length})` },
          { key: "visibles", label: `Visibles (${totalActivas})` },
          { key: "ocultas",  label: `Ocultas (${reseñas.length - totalActivas})` },
        ].map(f => (
          <button
            key={f.key}
            style={{ ...s.filtroBtn, backgroundColor: filtro === f.key ? "#0B1628" : "white", color: filtro === f.key ? "white" : "#64748b" }}
            onClick={() => setFiltro(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {filtradas.length === 0 ? (
        <div style={s.empty}>
          <span style={{ fontSize: "40px" }}>⭐</span>
          <p>No hay reseñas en esta categoría</p>
        </div>
      ) : (
        <div style={s.lista}>
          {filtradas.map(r => (
            <div key={r.id} style={{ ...s.card, opacity: r.activo ? 1 : 0.6 }}>
              <div style={s.cardTop}>
                <div style={s.cardLeft}>
                  <div style={s.avatar}>{r.cliente_nombre?.charAt(0).toUpperCase() || "?"}</div>
                  <div>
                    <span style={s.clienteNombre}>{r.cliente_nombre}</span>
                    <span style={s.productoNombre}>→ {r.producto_nombre}</span>
                  </div>
                </div>
                <div style={s.cardRight}>
                  <Estrellas valor={r.calificacion} tamaño="sm" />
                  <span style={s.fecha}>
                    {new Date(r.creado_en).toLocaleDateString("es-CO", {
                      day: "2-digit", month: "short", year: "numeric"
                    })}
                  </span>
                </div>
              </div>

              {r.comentario && (
                <p style={s.comentario}>"{r.comentario}"</p>
              )}

              <div style={s.acciones}>
                <span style={{
                  ...s.estadoBadge,
                  backgroundColor: r.activo ? "#f0fdf4" : "#f1f5f9",
                  color: r.activo ? "#0F6E56" : "#64748b",
                }}>
                  {r.activo ? "✓ Visible" : "Oculta"}
                </span>
                <button
                  style={{ ...s.accionBtn, color: r.activo ? "#64748b" : "#0F6E56" }}
                  onClick={() => handleToggle(r.id)}
                >
                  {r.activo ? "Ocultar" : "Mostrar"}
                </button>
                <button
                  style={{ ...s.accionBtn, color: "#ef4444" }}
                  onClick={() => handleEliminar(r.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const s = {
  page:       { padding: "24px" },
  loading:    { padding: "24px", color: "#64748b", fontSize: "14px" },
  header:     { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  headerLeft: { display: "flex", alignItems: "center", gap: "10px" },
  title:      { fontSize: "20px", fontWeight: "700", color: "#0f172a", margin: 0 },
  statsRow:   { display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" },
  statCard:   { flex: 1, minWidth: "120px", backgroundColor: "#f8fafc", borderRadius: "12px", padding: "12px 16px", display: "flex", flexDirection: "column", gap: "4px", border: "1px solid #e2e8f0" },
  statLabel:  { fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" },
  statValue:  { fontSize: "22px", fontWeight: "700", color: "#0f172a" },
  filtros:    { display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" },
  filtroBtn:  { padding: "7px 16px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" },
  empty:      { textAlign: "center", padding: "60px 24px", color: "#94a3b8", fontSize: "14px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" },
  lista:      { display: "flex", flexDirection: "column", gap: "12px" },
  card:       { backgroundColor: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "10px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" },
  cardTop:    { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" },
  cardLeft:   { display: "flex", alignItems: "center", gap: "10px" },
  avatar:     { width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#0B1628", color: "white", fontSize: "14px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  clienteNombre: { display: "block", fontSize: "14px", fontWeight: "600", color: "#0f172a" },
  productoNombre: { display: "block", fontSize: "12px", color: "#64748b" },
  cardRight:  { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" },
  fecha:      { fontSize: "11px", color: "#94a3b8" },
  comentario: { fontSize: "13px", color: "#374151", lineHeight: "1.6", fontStyle: "italic", margin: 0, paddingLeft: "12px", borderLeft: "3px solid #e2e8f0" },
  acciones:   { display: "flex", alignItems: "center", gap: "12px" },
  estadoBadge:{ padding: "3px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: "600" },
  accionBtn:  { background: "none", border: "none", fontSize: "12px", fontWeight: "600", cursor: "pointer", padding: "0" },
};
