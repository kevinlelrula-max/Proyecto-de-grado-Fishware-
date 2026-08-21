import { useState } from "react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function SelectorEmpresa({ empresas, token, rolId = 1, onSelect, onClose }) {
  const [vista, setVista]     = useState("lista"); // "lista" | "crear"
  const [form, setForm]       = useState({ nombre: "", nit: "", email: "", telefono: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const seleccionar = async (empresa_id) => {
    setLoading(true);
    setError("");
    try {
      const res  = await fetch(`${BASE_URL}/api/auth/seleccionar-empresa`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ empresa_id }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        onSelect(data);
      } else {
        setError(data.error || "Error al seleccionar empresa");
      }
    } catch {
      setError("No se pudo conectar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const crear = async () => {
    if (!form.nombre.trim()) { setError("El nombre de la tienda es obligatorio"); return; }
    setLoading(true);
    setError("");
    try {
      const res  = await fetch(`${BASE_URL}/api/empresa/crear-adicional`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        onSelect(data);
      } else {
        setError(data.error || "Error al crear la tienda");
      }
    } catch {
      setError("No se pudo conectar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const volverALista = () => {
    setVista("lista");
    setError("");
    setForm({ nombre: "", nit: "", email: "", telefono: "" });
  };

  return (
    <div style={s.overlay}>
      <div style={s.card}>

        {/* Header */}
        <div style={{ ...s.header, position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="10" fill="#1e3a5f"/>
              <path d="M8 18c0-5 4-9 9-9s9 4 9 9-4 9-9 9" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
              <path d="M26 18h6l-3-4 3-4h-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="14" cy="15" r="1.5" fill="white"/>
            </svg>
            {onClose && (
              <button
                onClick={onClose}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#94a3b8", lineHeight: 1 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
          {vista === "lista" ? (
            <>
              <h2 style={s.title}>Selecciona tu tienda</h2>
              <p style={s.subtitle}>Elige el panel que quieres gestionar</p>
            </>
          ) : (
            <>
              <h2 style={s.title}>Nueva tienda</h2>
              <p style={s.subtitle}>Agrega una tienda adicional a tu cuenta</p>
            </>
          )}
        </div>

        {error && (
          <div style={s.errorBox}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Lista de tiendas */}
        {vista === "lista" && (
          <>
            <div style={s.lista}>
              {empresas.map((emp) => (
                <button
                  key={emp.id}
                  style={s.empCard}
                  onClick={() => seleccionar(emp.id)}
                  disabled={loading}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#00C9A7"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}
                >
                  <div style={s.empIcon}>
                    {emp.logo_url
                      ? <img src={`${BASE_URL}${emp.logo_url}`} alt="" style={{ width: 32, height: 32, objectFit: "contain", borderRadius: 6 }} />
                      : <span style={{ fontSize: 20 }}>🏪</span>
                    }
                  </div>
                  <div style={s.empInfo}>
                    <div style={s.empNombre}>{emp.nombre}</div>
                    <div style={s.empRol}>
                      {emp.rol_id === 1 ? "SuperAdmin" : emp.rol_id === 2 ? "Administrador" : "Empleado"}
                    </div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              ))}
            </div>

            {(rolId === 1 || rolId === 2) && (
              <button
                style={s.btnCrear}
                onClick={() => { setVista("crear"); setError(""); }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#00C9A7"; e.currentTarget.style.color = "#00C9A7"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.color = "#64748b"; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Crear nueva tienda
              </button>
            )}
          </>
        )}

        {/* Formulario nueva tienda */}
        {vista === "crear" && (
          <>
            <div style={s.formWrap}>
              {[
                { name: "nombre",   label: "Nombre de la tienda *", placeholder: "Mi tienda" },
                { name: "nit",      label: "NIT (opcional)",         placeholder: "900.123.456-1" },
                { name: "email",    label: "Email (opcional)",       placeholder: "tienda@correo.com" },
                { name: "telefono", label: "Teléfono (opcional)",    placeholder: "3001234567" },
              ].map(({ name, label, placeholder }) => (
                <div key={name} style={{ marginBottom: 12 }}>
                  <label style={s.label}>{label}</label>
                  <input
                    style={s.input}
                    value={form[name]}
                    onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))}
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button style={s.btnVolver} onClick={volverALista}>
                Volver
              </button>
              <button
                style={{ ...s.btnPrimario, flex: 1, opacity: loading ? 0.75 : 1 }}
                onClick={crear}
                disabled={loading}
              >
                {loading ? "Creando..." : "Crear tienda"}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

const s = {
  overlay: {
    position: "fixed", inset: 0, background: "rgba(15,23,42,0.76)",
    backdropFilter: "blur(5px)", display: "flex", alignItems: "center",
    justifyContent: "center", zIndex: 9999, padding: 24,
  },
  card: {
    background: "#fff", borderRadius: 18, padding: "32px 28px",
    width: "100%", maxWidth: 420, boxShadow: "0 24px 64px rgba(0,0,0,0.24)",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  header:  { marginBottom: 24 },
  title:   { fontSize: 22, fontWeight: 700, color: "#0f172a", marginBottom: 5, letterSpacing: "-0.02em" },
  subtitle: { fontSize: 14, color: "#64748b" },
  errorBox: {
    background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10,
    padding: "10px 14px", fontSize: 13, color: "#b91c1c", marginBottom: 14,
    display: "flex", alignItems: "center", gap: 8,
  },
  lista: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 },
  empCard: {
    display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
    background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 12,
    cursor: "pointer", textAlign: "left", width: "100%", transition: "border-color 0.15s",
  },
  empIcon: {
    width: 44, height: 44, borderRadius: 10, background: "#fff",
    border: "1px solid #e2e8f0", display: "flex", alignItems: "center",
    justifyContent: "center", flexShrink: 0,
  },
  empInfo:   { flex: 1, minWidth: 0 },
  empNombre: { fontSize: 14, fontWeight: 600, color: "#0f172a" },
  empRol:    { fontSize: 12, color: "#64748b", marginTop: 2 },
  btnCrear: {
    width: "100%", padding: 11, background: "none", border: "1.5px dashed #cbd5e1",
    borderRadius: 12, fontSize: 13, color: "#64748b", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: 6, fontWeight: 500, transition: "all 0.15s",
  },
  formWrap: {},
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 5 },
  input: {
    width: "100%", padding: "10px 13px", borderRadius: 10, border: "1.5px solid #e2e8f0",
    fontSize: 14, color: "#0f172a", background: "white", outline: "none",
    boxSizing: "border-box",
  },
  btnVolver: {
    padding: "12px 18px", background: "#f1f5f9", border: "none", borderRadius: 10,
    fontSize: 14, color: "#64748b", cursor: "pointer", fontWeight: 500,
  },
  btnPrimario: {
    padding: 12, background: "#2563eb", color: "white", fontSize: 14, fontWeight: 600,
    border: "none", borderRadius: 10, cursor: "pointer",
  },
};
