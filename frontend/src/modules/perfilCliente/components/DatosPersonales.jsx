export default function DatosPersonales({ perfil, form, guardando, exito, error, onChange, onGuardar }) {
  return (
    <div style={s.card}>
      <div style={s.header}>
        <div>
          <h3 style={s.title}>Datos personales</h3>
          <p style={s.subtitle}>Actualiza tu información de contacto</p>
        </div>
        <div style={s.avatar}>
          {perfil?.nombre?.charAt(0).toUpperCase()}
        </div>
      </div>

      {error && <div style={s.errorBox}>⚠️ {error}</div>}
      {exito && <div style={s.exitoBox}>✓ Datos actualizados correctamente</div>}

      <div style={s.grid}>
        <Field label="Nombre">
          <input style={s.input} value={form.nombre} onChange={e => onChange("nombre", e.target.value)} placeholder="Tu nombre" />
        </Field>
        <Field label="Apellido">
          <input style={s.input} value={form.apellido} onChange={e => onChange("apellido", e.target.value)} placeholder="Tu apellido" />
        </Field>
        <Field label="Teléfono">
          <input style={s.input} value={form.telefono} onChange={e => onChange("telefono", e.target.value)} placeholder="+57 300 000 0000" />
        </Field>
        <Field label="Correo electrónico">
          <input style={{ ...s.input, backgroundColor: "#f8fafc", color: "#94a3b8" }} value={perfil?.usuario || ""} disabled />
          <p style={s.hint}>El correo no se puede cambiar</p>
        </Field>
        <Field label="Dirección de entrega" full>
          <input style={s.input} value={form.direccion} onChange={e => onChange("direccion", e.target.value)} placeholder="Calle 123 #45-67, Apto 201" />
        </Field>
      </div>

      <button
        style={{ ...s.btnGuardar, opacity: guardando ? 0.7 : 1 }}
        onClick={onGuardar}
        disabled={guardando}
      >
        {guardando ? "Guardando..." : "Guardar cambios"}
      </button>
    </div>
  );
}

function Field({ label, children, full }) {
  return (
    <div style={{ gridColumn: full ? "1 / -1" : "span 1" }}>
      <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const s = {
  card: {
    backgroundColor: "white",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: "16px", fontWeight: "700", color: "#0f172a" },
  subtitle: { fontSize: "13px", color: "#64748b", marginTop: "2px" },
  avatar: {
    width: "52px", height: "52px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #00C9A7, #0099FF)",
    color: "white",
    fontSize: "20px", fontWeight: "700",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  errorBox: {
    padding: "10px 14px", backgroundColor: "#fef2f2",
    border: "1px solid #fecaca", borderRadius: "10px",
    fontSize: "13px", color: "#b91c1c",
  },
  exitoBox: {
    padding: "10px 14px", backgroundColor: "#f0fdf4",
    border: "1px solid #bbf7d0", borderRadius: "10px",
    fontSize: "13px", fontWeight: "600", color: "#0F6E56",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
  },
  input: {
    width: "100%", padding: "10px 12px",
    border: "1.5px solid #e2e8f0", borderRadius: "9px",
    fontSize: "14px", color: "#0f172a",
    backgroundColor: "white", outline: "none",
    boxSizing: "border-box",
  },
  hint: { fontSize: "11px", color: "#94a3b8", marginTop: "4px" },
  btnGuardar: {
    alignSelf: "flex-start",
    padding: "10px 24px",
    backgroundColor: "#0B1628",
    color: "white", border: "none",
    borderRadius: "10px", fontSize: "14px",
    fontWeight: "600", cursor: "pointer",
  },
};