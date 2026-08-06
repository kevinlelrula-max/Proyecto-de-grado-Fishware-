export default function OnboardingCard({ onIrA, onboarding = {}, onSkip }) {
  const {
    tieneProductos = false,
    tieneLogo      = false,
    tienePerfil    = false,
    tieneLealtad   = false,
    tieneEquipo    = false,
    tieneTienda    = false,
    tieneReferidos = false,
    completados    = 0,
    total          = 7,
  } = onboarding;

  const porcentaje = Math.round((completados / total) * 100);

  const pasos = [
    {
      icon:      "📦",
      titulo:    "Agrega tu primer producto",
      desc:      "Sube tu catálogo con fotos, precios y stock.",
      accion:    "productos",
      tiempo:    "2 min",
      completo:  tieneProductos,
    },
    {
      icon:      "🎨",
      titulo:    "Sube el logo de tu tienda",
      desc:      "La imagen de tu empresa. Aparece en tu tienda online.",
      accion:    "configuracion",
      tiempo:    "1 min",
      completo:  tieneLogo,
    },
    {
      icon:      "🏪",
      titulo:    "Personaliza tu tienda online",
      desc:      "Color, banner y descripción para que luzca profesional.",
      accion:    "editor",
      tiempo:    "3 min",
      completo:  tieneTienda,
    },
    {
      icon:      "📋",
      titulo:    "Completa tu perfil de empresa",
      desc:      "Agrega descripción, WhatsApp y datos de contacto.",
      accion:    "configuracion",
      tiempo:    "2 min",
      completo:  tienePerfil,
    },
    {
      icon:      "🏆",
      titulo:    "Crea niveles de lealtad",
      desc:      "Premia a tus mejores clientes con descuentos especiales.",
      accion:    "lealtad",
      tiempo:    "3 min",
      completo:  tieneLealtad,
    },
    {
      icon:      "👥",
      titulo:    "Agrega tu equipo",
      desc:      "Crea usuarios para cajeros y administradores.",
      accion:    "usuarios",
      tiempo:    "2 min",
      completo:  tieneEquipo,
    },
    {
      icon:      "🤝",
      titulo:    "Configura el sistema de referidos",
      desc:      "Define las recompensas para clientes que traigan amigos.",
      accion:    "referidos",
      tiempo:    "3 min",
      completo:  tieneReferidos,
    },
  ];

  const pendientes = pasos.filter(p => !p.completo);
  const hechos     = pasos.filter(p =>  p.completo);

  return (
    <div style={s.wrap}>

      {/* ── HEADER ── */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <h2 style={s.title}>
            {completados === 0
              ? "¡Bienvenido! Configura tu tienda"
              : completados === total
              ? "¡Tu tienda está lista! 🎉"
              : `Casi listo — ${total - completados} paso${total - completados > 1 ? "s" : ""} más`}
          </h2>
          <p style={s.subtitle}>
            {completados === 0
              ? "Completa estos pasos para empezar a vender."
              : `${completados} de ${total} pasos completados`}
          </p>

          {/* Barra de progreso */}
          <div style={s.progressBar}>
            <div style={{ ...s.progressFill, width: `${porcentaje}%` }} />
          </div>
          <p style={s.progressLabel}>{porcentaje}% completado</p>
        </div>

        <div style={s.headerRight}>
          <span style={s.headerIlust}>
            {completados === total ? "🎊" : "🏪"}
          </span>
          {onSkip && completados > 0 && (
            <button style={s.skipBtn} onClick={onSkip}>
              Ver mi panel →
            </button>
          )}
        </div>
      </div>

      {/* ── PASOS PENDIENTES ── */}
      {pendientes.length > 0 && (
        <>
          <p style={s.seccionLabel}>📌 Pendientes</p>
          <div style={s.grid}>
            {pendientes.map((paso, i) => (
              <button
                key={i}
                style={s.pasoCard}
                onClick={() => onIrA(paso.accion)}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "#00C9A7";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,201,167,0.12)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={s.pasoTop}>
                  <span style={s.pasoIcon}>{paso.icon}</span>
                  <span style={s.pasoTiempo}>⏱ {paso.tiempo}</span>
                </div>
                <p style={s.pasoTitulo}>{paso.titulo}</p>
                <p style={s.pasoDesc}>{paso.desc}</p>
                <span style={s.pasoLink}>Ir ahora →</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* ── PASOS COMPLETADOS ── */}
      {hechos.length > 0 && (
        <>
          <p style={s.seccionLabel}>✅ Completados</p>
          <div style={s.grid}>
            {hechos.map((paso, i) => (
              <button
                key={i}
                style={s.pasoCardDone}
                onClick={() => onIrA(paso.accion)}
              >
                <div style={s.pasoTop}>
                  <span style={s.pasoIcon}>{paso.icon}</span>
                  <span style={s.doneBadge}>✓ Listo</span>
                </div>
                <p style={s.pasoTituloDone}>{paso.titulo}</p>
                <p style={s.pasoDescDone}>{paso.desc}</p>
              </button>
            ))}
          </div>
        </>
      )}

    </div>
  );
}

const s = {
  wrap: {
    display:       "flex",
    flexDirection: "column",
    gap:           "20px",
  },
  header: {
    background:   "linear-gradient(135deg, #0B1628 0%, #0d2b45 100%)",
    borderRadius: "16px",
    padding:      "28px 32px",
    display:      "flex",
    alignItems:   "center",
    justifyContent: "space-between",
    gap:          "20px",
  },
  headerLeft: { flex: 1 },
  title: {
    fontSize:      "22px",
    fontWeight:    "800",
    color:         "white",
    letterSpacing: "-0.02em",
    marginBottom:  "6px",
  },
  subtitle: {
    fontSize:     "14px",
    color:        "rgba(255,255,255,0.6)",
    marginBottom: "16px",
  },
  progressBar: {
    width:        "100%",
    height:       "8px",
    borderRadius: "99px",
    backgroundColor: "rgba(255,255,255,0.15)",
    overflow:     "hidden",
    marginBottom: "8px",
  },
  progressFill: {
    height:       "100%",
    borderRadius: "99px",
    backgroundColor: "#00C9A7",
    transition:   "width 0.5s ease",
  },
  progressLabel: {
    fontSize:  "12px",
    color:     "rgba(255,255,255,0.5)",
    fontWeight: "600",
  },
  headerRight: {
    display:       "flex",
    flexDirection: "column",
    alignItems:    "center",
    gap:           "12px",
    flexShrink:    0,
  },
  headerIlust: {
    fontSize:   "64px",
    lineHeight: 1,
  },
  skipBtn: {
    padding:         "8px 16px",
    backgroundColor: "rgba(255,255,255,0.1)",
    color:           "white",
    border:          "1px solid rgba(255,255,255,0.2)",
    borderRadius:    "8px",
    fontSize:        "12px",
    fontWeight:      "600",
    cursor:          "pointer",
    whiteSpace:      "nowrap",
  },
  seccionLabel: {
    fontSize:   "13px",
    fontWeight: "700",
    color:      "#64748b",
    margin:     "0",
  },
  grid: {
    display:             "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
    gap:                 "14px",
  },
  pasoCard: {
    backgroundColor: "white",
    borderRadius:    "14px",
    border:          "1.5px solid #e2e8f0",
    padding:         "20px",
    display:         "flex",
    flexDirection:   "column",
    gap:             "8px",
    cursor:          "pointer",
    textAlign:       "left",
    transition:      "all 0.2s",
  },
  pasoCardDone: {
    backgroundColor: "#f0fdf4",
    borderRadius:    "14px",
    border:          "1.5px solid #bbf7d0",
    padding:         "20px",
    display:         "flex",
    flexDirection:   "column",
    gap:             "8px",
    cursor:          "pointer",
    textAlign:       "left",
    opacity:         "0.8",
    transition:      "all 0.2s",
  },
  pasoTop: {
    display:        "flex",
    alignItems:     "center",
    justifyContent: "space-between",
    marginBottom:   "4px",
  },
  pasoIcon:   { fontSize: "28px" },
  pasoTiempo: { fontSize: "11px", color: "#94a3b8", fontWeight: "500" },
  doneBadge: {
    fontSize:        "11px",
    fontWeight:      "700",
    color:           "#16a34a",
    backgroundColor: "#dcfce7",
    padding:         "3px 8px",
    borderRadius:    "99px",
  },
  pasoTitulo: {
    fontSize:   "14px",
    fontWeight: "700",
    color:      "#0f172a",
    lineHeight: "1.3",
  },
  pasoTituloDone: {
    fontSize:   "14px",
    fontWeight: "700",
    color:      "#166534",
    lineHeight: "1.3",
  },
  pasoDesc: {
    fontSize:   "12px",
    color:      "#64748b",
    lineHeight: "1.5",
    flex:       1,
  },
  pasoDescDone: {
    fontSize:   "12px",
    color:      "#4ade80",
    lineHeight: "1.5",
    flex:       1,
  },
  pasoLink: {
    fontSize:   "12px",
    fontWeight: "700",
    color:      "#00C9A7",
    marginTop:  "4px",
  },
};
