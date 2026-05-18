import { useLealtad } from "./hooks/useLealtad";
import NivelCard from "./components/NivelCard";
import NivelForm from "./components/NivelForm";

export default function NivelesLealtad() {
  const {
    niveles,
    loading,
    error,
    guardando,
    exito,
    form,
    editandoId,
    mostrarForm,
    handleChange,
    abrirFormNuevo,
    abrirFormEditar,
    cerrarForm,
    guardar,
    eliminar,
    toggleActivo,
  } = useLealtad();

  return (
    <div style={s.page}>

      {/* Header */}
      <div style={s.header}>
        <div>
          <h2 style={s.title}>Niveles de lealtad</h2>
          <p style={s.subtitle}>
            Define recompensas para tus clientes más frecuentes — verán precios especiales automáticamente
          </p>
        </div>
        <button style={s.btnNuevo} onClick={abrirFormNuevo}>
          + Nuevo nivel
        </button>
      </div>

      {/* Éxito */}
      {exito && (
        <div style={s.exitoBox}>✓ {exito}</div>
      )}

      {/* Error global */}
      {error && !mostrarForm && (
        <div style={s.errorBox}>⚠️ {error}</div>
      )}

      {/* Loading */}
      {loading ? (
        <div style={s.loading}>
          <span style={s.loadingIcon}>🏆</span>
          <p style={s.loadingText}>Cargando niveles...</p>
        </div>
      ) : niveles.length === 0 ? (
        /* Empty state */
        <div style={s.empty}>
          <span style={s.emptyIcon}>🏆</span>
          <p style={s.emptyTitle}>Aún no tienes niveles de lealtad</p>
          <p style={s.emptyDesc}>
            Crea niveles para recompensar a tus clientes más frecuentes con precios especiales.
          </p>
          <button style={s.emptyBtn} onClick={abrirFormNuevo}>
            Crear primer nivel
          </button>
        </div>
      ) : (
        <>
          {/* Info */}
          <div style={s.infoBox}>
            <span style={s.infoIcon}>💡</span>
            <p style={s.infoText}>
              Los clientes que superen el monto mínimo de compras en el mes verán automáticamente
              los precios con descuento en tu tienda online.
            </p>
          </div>

          {/* Grid de niveles */}
          <div style={s.grid}>
            {niveles.map((nivel) => (
              <NivelCard
                key={nivel.id}
                nivel={nivel}
                onEditar={abrirFormEditar}
                onEliminar={eliminar}
                onToggle={toggleActivo}
              />
            ))}
          </div>
        </>
      )}

      {/* Modal form */}
      {mostrarForm && (
        <NivelForm
          form={form}
          editandoId={editandoId}
          guardando={guardando}
          error={error}
          onChange={handleChange}
          onGuardar={guardar}
          onCancelar={cerrarForm}
        />
      )}

    </div>
  );
}

const s = {
  page: {
    padding: "28px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
  },
  title: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: "-0.02em",
    marginBottom: "4px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#64748b",
    lineHeight: "1.5",
    maxWidth: "500px",
  },
  btnNuevo: {
    padding: "10px 20px",
    backgroundColor: "#0F6E56",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    flexShrink: 0,
  },
  exitoBox: {
    padding: "12px 16px",
    backgroundColor: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#0F6E56",
  },
  errorBox: {
    padding: "12px 16px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "10px",
    fontSize: "13px",
    color: "#b91c1c",
  },
  loading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    padding: "60px",
  },
  loadingIcon: { fontSize: "40px" },
  loadingText: { fontSize: "14px", color: "#94a3b8" },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    padding: "60px 24px",
    textAlign: "center",
  },
  emptyIcon: { fontSize: "52px" },
  emptyTitle: { fontSize: "16px", fontWeight: "700", color: "#0f172a" },
  emptyDesc: { fontSize: "14px", color: "#64748b", maxWidth: "360px", lineHeight: "1.6" },
  emptyBtn: {
    marginTop: "8px",
    padding: "11px 24px",
    backgroundColor: "#0F6E56",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  infoBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    padding: "14px 16px",
    backgroundColor: "#fffbeb",
    borderRadius: "12px",
    border: "1px solid #fde68a",
  },
  infoIcon: { fontSize: "18px", flexShrink: 0 },
  infoText: { fontSize: "13px", color: "#92400e", lineHeight: "1.6" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "16px",
  },
};