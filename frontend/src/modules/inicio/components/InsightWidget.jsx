import { useEffect, useState } from "react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function InsightWidget() {
  const [insight, setInsight]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [generatedAt, setAt]    = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/api/insight`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setInsight(d.insight);
        setAt(d.generatedAt);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const hora = generatedAt
    ? new Date(generatedAt).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div style={s.card}>
      <div style={s.header}>
        <div style={s.iconWrap}>✦</div>
        <div>
          <div style={s.title}>Análisis del día</div>
          <div style={s.sub}>Generado con IA · {hora ? `Actualizado a las ${hora}` : "Hoy"}</div>
        </div>
      </div>

      <div style={s.body}>
        {loading && (
          <div style={s.loading}>
            <div style={s.dots}>
              <span style={{ ...s.dot, animationDelay: "0s" }} />
              <span style={{ ...s.dot, animationDelay: ".2s" }} />
              <span style={{ ...s.dot, animationDelay: ".4s" }} />
            </div>
            <span style={s.loadingText}>Analizando tu negocio...</span>
          </div>
        )}

        {error && (
          <div style={s.error}>
            No se pudo generar el análisis. Verificá que la clave de API esté configurada.
          </div>
        )}

        {insight && !loading && (
          <p style={s.text}>{insight}</p>
        )}
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: .2; transform: scale(.8); }
          50%       { opacity: 1;  transform: scale(1);  }
        }
      `}</style>
    </div>
  );
}

const s = {
  card: {
    background: "linear-gradient(135deg, #0B1628 0%, #0f2240 100%)",
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    border: "1px solid rgba(255,255,255,0.06)",
    boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
  },
  header: {
    display: "flex", alignItems: "center", gap: 12, marginBottom: 16,
  },
  iconWrap: {
    width: 36, height: 36, borderRadius: 10,
    background: "rgba(0,201,167,0.15)",
    border: "1px solid rgba(0,201,167,0.25)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 16, color: "#00C9A7", flexShrink: 0,
  },
  title: { fontSize: 14, fontWeight: 700, color: "#fff" },
  sub:   { fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 },
  body:  { minHeight: 60 },
  text: {
    fontSize: 14, color: "rgba(255,255,255,0.82)",
    lineHeight: 1.75, margin: 0,
  },
  loading: {
    display: "flex", alignItems: "center", gap: 10,
  },
  dots: { display: "flex", gap: 5 },
  dot: {
    display: "inline-block", width: 7, height: 7,
    borderRadius: "50%", background: "#00C9A7",
    animation: "blink 1.2s ease-in-out infinite",
  },
  loadingText: { fontSize: 13, color: "rgba(255,255,255,0.4)" },
  error: {
    fontSize: 13, color: "#f87171",
    background: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.15)",
    borderRadius: 8, padding: "10px 14px",
  },
};
