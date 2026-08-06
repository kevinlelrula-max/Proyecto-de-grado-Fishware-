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
    background: "#fff",
    borderRadius: 12,
    padding: 20,
    border: "1px solid #e2e8f0",
    borderLeft: "3px solid #00C9A7",
  },
  header: {
    display: "flex", alignItems: "center", gap: 10, marginBottom: 12,
  },
  iconWrap: {
    width: 30, height: 30, borderRadius: 8,
    background: "#f0fdf9",
    border: "1px solid #ccfbf1",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 13, color: "#00C9A7", flexShrink: 0,
  },
  title: { fontSize: 13, fontWeight: 600, color: "#0f172a" },
  sub:   { fontSize: 11, color: "#94a3b8", marginTop: 1 },
  body:  { minHeight: 40 },
  text: {
    fontSize: 13, color: "#475569",
    lineHeight: 1.75, margin: 0,
  },
  loading: {
    display: "flex", alignItems: "center", gap: 10,
  },
  dots: { display: "flex", gap: 5 },
  dot: {
    display: "inline-block", width: 6, height: 6,
    borderRadius: "50%", background: "#00C9A7",
    animation: "blink 1.2s ease-in-out infinite",
  },
  loadingText: { fontSize: 13, color: "#94a3b8" },
  error: {
    fontSize: 13, color: "#b91c1c",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: 8, padding: "10px 14px",
  },
};
