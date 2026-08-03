import { useState } from "react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const MCP_SSE_URL = `${BASE_URL}/api/mcp/sse`;

export default function ConectorIA() {
  const [token, setToken]       = useState(null);
  const [comando, setComando]   = useState("");
  const [cargando, setCargando] = useState(false);
  const [copiado, setCopiado]   = useState("");
  const [error, setError]       = useState(null);
  const [tab, setTab]           = useState("claudeai"); // "claudeai" | "claudecode"

  const generarToken = async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/api/mcp/generar-token`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error("Error al generar token");
      const data = await res.json();
      setToken(data.token);
      setComando(data.comandoClaude);
    } catch {
      setError("No se pudo generar el token. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  const copiar = (texto, key) => {
    navigator.clipboard.writeText(texto);
    setCopiado(key);
    setTimeout(() => setCopiado(""), 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Encabezado */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: "linear-gradient(135deg,#0B1628,#1e3a5f)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20,
        }}>🤖</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>Conector Claude AI</div>
          <div style={{ fontSize: 13, color: "#6b7280" }}>Consulta los datos de tu negocio con lenguaje natural</div>
        </div>
      </div>

      {/* Descripción */}
      <div style={{
        background: "#f0f9ff", border: "1px solid #bae6fd",
        borderRadius: 10, padding: "14px 16px",
        fontSize: 13, color: "#0369a1", lineHeight: 1.6,
      }}>
        Conecta tu negocio a Claude AI y pregunta cosas como <strong>"¿Cuánto vendí esta semana?"</strong>,{" "}
        <strong>"¿Qué productos se van a agotar?"</strong> o <strong>"¿Quiénes son mis mejores clientes?"</strong>.
        Solo lectura — nunca puede modificar tus datos.
      </div>

      {/* Link documentación */}
      <div style={{ textAlign: "right", marginTop: -12 }}>
        <a
          href={`${BASE_URL}/api/mcp`}
          target="_blank"
          rel="noreferrer"
          style={{ fontSize: 12, color: "#00C9A7", textDecoration: "none", fontWeight: 500 }}
        >
          Ver documentación MCP →
        </a>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => setTab("claudeai")}
          style={{
            padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600,
            cursor: "pointer", border: "1.5px solid",
            background: tab === "claudeai" ? "#0B1628" : "#fff",
            color: tab === "claudeai" ? "#fff" : "#6b7280",
            borderColor: tab === "claudeai" ? "#0B1628" : "#e5e7eb",
          }}
        >
          🌐 Claude.ai
        </button>
        <button
          onClick={() => { setTab("claudecode"); setToken(null); setComando(""); }}
          style={{
            padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600,
            cursor: "pointer", border: "1.5px solid",
            background: tab === "claudecode" ? "#0B1628" : "#fff",
            color: tab === "claudecode" ? "#fff" : "#6b7280",
            borderColor: tab === "claudecode" ? "#0B1628" : "#e5e7eb",
          }}
        >
          💻 Claude Code
        </button>
      </div>

      {/* ── TAB: Claude.ai ── */}
      {tab === "claudeai" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{
            background: "#f0fdf4", border: "1px solid #bbf7d0",
            borderRadius: 10, padding: "12px 16px",
            fontSize: 13, color: "#166534", lineHeight: 1.6,
          }}>
            <strong>Sin tokens ni instalación.</strong> Claude.ai maneja la autorización automáticamente con OAuth.
          </div>

          {/* URL */}
          <div>
            <div style={labelStyle}>URL del servidor MCP</div>
            <div style={{ ...codeBoxStyle, position: "relative", paddingRight: 90 }}>
              {MCP_SSE_URL}
              <button onClick={() => copiar(MCP_SSE_URL, "url")} style={btnCopiarStyle}>
                {copiado === "url" ? "✓ copiado" : "copiar"}
              </button>
            </div>
          </div>

          {/* Pasos */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              ["01", <>Abre <strong>claude.ai</strong> → Settings → Conectores → Agregar</>],
              ["02", <>Pegá la URL de arriba y hacé clic en <strong>Agregar</strong></>],
              ["03", <>Te redirige al login de Merkai → iniciá sesión → <strong style={{ color: "#166534" }}>Conectado</strong></>],
            ].map(([n, txt]) => (
              <div key={n} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, color: "#374151" }}>
                <span style={{ color: "#00C9A7", fontWeight: 700, flexShrink: 0, fontSize: 11,
                  background: "rgba(0,201,167,0.1)", padding: "2px 8px", borderRadius: 4 }}>[{n}]</span>
                {txt}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB: Claude Code terminal ── */}
      {tab === "claudecode" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>
            Genera un token para conectar Merkai MCP desde el terminal de <strong>Claude Code</strong>.
            El token es válido por 30 días y es de solo lectura.
          </div>

          {!token && (
            <button
              onClick={generarToken}
              disabled={cargando}
              style={{
                padding: "12px 24px",
                background: cargando ? "#e5e7eb" : "#0B1628",
                color: cargando ? "#9ca3af" : "white",
                border: "none", borderRadius: 10,
                fontSize: 14, fontWeight: 600,
                cursor: cargando ? "not-allowed" : "pointer",
                alignSelf: "flex-start",
              }}
            >
              {cargando ? "Generando..." : "🔑 Generar token de conexión"}
            </button>
          )}

          {error && (
            <div style={{ fontSize: 13, color: "#ef4444", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px" }}>
              {error}
            </div>
          )}

          {token && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Token */}
              <div>
                <div style={labelStyle}>Token MCP · válido 30 días</div>
                <div style={{ ...codeBoxStyle, position: "relative", paddingRight: 90 }}>
                  {token}
                  <button onClick={() => copiar(token, "token")} style={btnCopiarStyle}>
                    {copiado === "token" ? "✓ copiado" : "copiar"}
                  </button>
                </div>
              </div>

              {/* Comando */}
              <div>
                <div style={labelStyle}>Comando · pegar en el terminal</div>
                <div style={{
                  background: "#0B1628", border: "1px solid #1e3a5f",
                  borderRadius: 8, padding: "12px 100px 12px 14px",
                  fontFamily: "monospace", fontSize: 11,
                  color: "#5eead4", wordBreak: "break-all",
                  lineHeight: 1.6, position: "relative",
                }}>
                  {comando}
                  <button
                    onClick={() => copiar(comando, "cmd")}
                    style={{ ...btnCopiarStyle, background: "rgba(94,234,212,0.15)", borderColor: "rgba(94,234,212,0.3)", color: "#5eead4" }}
                  >
                    {copiado === "cmd" ? "✓ copiado" : "copiar"}
                  </button>
                </div>
              </div>

              <div style={{ fontSize: 12, color: "#9ca3af", textAlign: "center" }}>
                ⚠️ Guarda este token. Expira en 30 días. Puedes generar uno nuevo cuando quieras.
              </div>

              <button
                onClick={() => { setToken(null); setComando(""); }}
                style={{ fontSize: 12, color: "#6b7280", background: "none", border: "none", cursor: "pointer", alignSelf: "center" }}
              >
                Generar nuevo token
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const labelStyle = {
  fontSize: 11, fontWeight: 700, color: "#6b7280",
  marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em",
};

const codeBoxStyle = {
  background: "#f9fafb", border: "1px solid #e5e7eb",
  borderRadius: 8, padding: 12,
  fontFamily: "monospace", fontSize: 11,
  color: "#374151", wordBreak: "break-all", lineHeight: 1.6,
};

const btnCopiarStyle = {
  position: "absolute", top: 10, right: 10,
  background: "rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.1)",
  color: "#374151", fontSize: 11, fontWeight: 700,
  padding: "4px 10px", borderRadius: 5, cursor: "pointer",
};
