import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function ResetearContrasena() {
  const [searchParams]   = useSearchParams();
  const navigate         = useNavigate();
  const token            = searchParams.get("token");

  const [contrasena,     setContrasena]     = useState("");
  const [confirmacion,   setConfirmacion]   = useState("");
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState("");
  const [exito,          setExito]          = useState(false);

  if (!token) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <div style={s.icon}>⚠️</div>
          <h2 style={s.title}>Enlace inválido</h2>
          <p style={s.subtitle}>Este enlace no es válido o ya expiró.</p>
          <Link to="/tienda/recuperar-contrasena" style={s.btn}>Solicitar nuevo enlace</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (contrasena.length < 6) return setError("La contraseña debe tener al menos 6 caracteres");
    if (contrasena !== confirmacion) return setError("Las contraseñas no coinciden");
    setLoading(true);
    setError("");
    try {
      await axios.post(`${API_URL}/api/clientes/resetear-contrasena`, {
        token,
        contrasena_nueva: contrasena,
      });
      setExito(true);
      setTimeout(() => navigate("/tienda/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Error al restablecer la contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.icon}>🔒</div>
        <h2 style={s.title}>Nueva contraseña</h2>

        {exito ? (
          <>
            <div style={s.exitoBox}>✓ Contraseña actualizada correctamente. Redirigiendo...</div>
          </>
        ) : (
          <>
            <p style={s.subtitle}>Elige una contraseña segura para tu cuenta.</p>
            <form onSubmit={handleSubmit} style={s.form}>
              <div style={s.fieldWrap}>
                <label style={s.label}>Nueva contraseña</label>
                <input
                  style={s.input}
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={contrasena}
                  onChange={(e) => { setContrasena(e.target.value); setError(""); }}
                  autoFocus
                />
              </div>
              <div style={s.fieldWrap}>
                <label style={s.label}>Confirmar contraseña</label>
                <input
                  style={s.input}
                  type="password"
                  placeholder="Repite la contraseña"
                  value={confirmacion}
                  onChange={(e) => { setConfirmacion(e.target.value); setError(""); }}
                />
              </div>
              {error && <div style={s.errorBox}>{error}</div>}
              <button
                type="submit"
                style={{ ...s.btn, opacity: loading ? 0.75 : 1 }}
                disabled={loading}
              >
                {loading ? "Guardando..." : "Guardar contraseña"}
              </button>
            </form>
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
    fontSize: "14px", color: "#0F6E56", fontWeight: "600", lineHeight: "1.5",
  },
  btn: {
    display: "inline-block", padding: "12px 24px",
    backgroundColor: "#0F6E56", color: "white",
    border: "none", borderRadius: "10px", fontSize: "14px",
    fontWeight: "700", cursor: "pointer", textDecoration: "none",
    width: "100%", textAlign: "center",
  },
};
