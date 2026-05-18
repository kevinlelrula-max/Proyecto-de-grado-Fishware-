import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function RecuperarContrasena() {
  const [usuario,  setUsuario]  = useState("");
  const [enviado,  setEnviado]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usuario.trim()) return setError("Ingresa tu correo electrónico");
    setLoading(true);
    setError("");
    try {
      await axios.post(`${API_URL}/api/clientes/recuperar-contrasena`, { usuario: usuario.trim() });
      setEnviado(true);
    } catch {
      setError("Ocurrió un error. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.icon}>🔑</div>
        <h2 style={s.title}>¿Olvidaste tu contraseña?</h2>

        {enviado ? (
          <>
            <div style={s.exitoBox}>
              ✓ Si el correo está registrado, recibirás un enlace en los próximos minutos.
            </div>
            <p style={s.hint}>Revisa también tu carpeta de spam.</p>
            <Link to="/tienda/login" style={s.link}>Volver al inicio de sesión</Link>
          </>
        ) : (
          <>
            <p style={s.subtitle}>
              Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
            </p>
            <form onSubmit={handleSubmit} style={s.form}>
              <div style={s.fieldWrap}>
                <label style={s.label}>Correo electrónico</label>
                <input
                  style={s.input}
                  type="email"
                  placeholder="tucorreo@ejemplo.com"
                  value={usuario}
                  onChange={(e) => { setUsuario(e.target.value); setError(""); }}
                  autoFocus
                />
              </div>
              {error && <div style={s.errorBox}>{error}</div>}
              <button
                type="submit"
                style={{ ...s.btn, opacity: loading ? 0.75 : 1 }}
                disabled={loading}
              >
                {loading ? "Enviando..." : "Enviar enlace"}
              </button>
            </form>
            <Link to="/tienda/login" style={s.linkSecundario}>Volver al inicio de sesión</Link>
          </>
        )}
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh", backgroundColor: "#f8fafc",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "24px", fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  card: {
    backgroundColor: "white", borderRadius: "20px",
    border: "1px solid #e2e8f0", padding: "40px 36px",
    width: "100%", maxWidth: "400px", textAlign: "center",
    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
  },
  icon:     { fontSize: "40px", marginBottom: "16px" },
  title:    { fontSize: "22px", fontWeight: "800", color: "#0f172a", marginBottom: "8px" },
  subtitle: { fontSize: "14px", color: "#64748b", lineHeight: "1.6", marginBottom: "24px" },
  form:     { display: "flex", flexDirection: "column", gap: "16px", textAlign: "left" },
  fieldWrap:{ display: "flex", flexDirection: "column", gap: "5px" },
  label:    { fontSize: "13px", fontWeight: "600", color: "#374151" },
  input: {
    padding: "10px 14px", borderRadius: "10px",
    border: "1.5px solid #e2e8f0", fontSize: "14px",
    color: "#0f172a", outline: "none",
  },
  errorBox: {
    padding: "10px 14px", backgroundColor: "#fef2f2",
    border: "1px solid #fecaca", borderRadius: "10px",
    fontSize: "13px", color: "#b91c1c",
  },
  exitoBox: {
    padding: "14px 16px", backgroundColor: "#f0fdf4",
    border: "1px solid #bbf7d0", borderRadius: "12px",
    fontSize: "14px", color: "#0F6E56", fontWeight: "600",
    marginBottom: "12px", lineHeight: "1.5",
  },
  btn: {
    padding: "12px", backgroundColor: "#0F6E56", color: "white",
    border: "none", borderRadius: "10px", fontSize: "14px",
    fontWeight: "700", cursor: "pointer",
  },
  hint: { fontSize: "13px", color: "#94a3b8", marginBottom: "16px" },
  link: { fontSize: "13px", color: "#0F6E56", fontWeight: "600", textDecoration: "none" },
  linkSecundario: {
    display: "block", marginTop: "16px",
    fontSize: "13px", color: "#94a3b8", textDecoration: "none",
  },
};
