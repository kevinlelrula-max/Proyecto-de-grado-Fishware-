export default function StatCard({ icon, label, valor, descripcion, color, bg, alerta }) {
  return (
    <div style={{
      ...s.card,
      borderTop: `3px solid ${alerta ? "#ef4444" : color}`,
    }}>
      <div style={s.top}>
        <div style={{ ...s.iconWrap, backgroundColor: alerta ? "#fef2f2" : bg }}>
          <span style={s.icon}>{icon}</span>
        </div>
        <p style={s.label}>{label}</p>
      </div>
      <p style={{ ...s.valor, color: alerta ? "#ef4444" : color }}>{valor}</p>
      {descripcion && <p style={s.descripcion}>{descripcion}</p>}
    </div>
  );
}

const s = {
  card: {
    backgroundColor: "white",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    transition: "box-shadow 0.2s",
  },
  top: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconWrap: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },
  icon: { lineHeight: 1 },
  label: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  valor: {
    fontSize: "32px",
    fontWeight: "800",
    letterSpacing: "-0.03em",
    lineHeight: 1,
  },
  descripcion: {
    fontSize: "12px",
    color: "#94a3b8",
  },
};