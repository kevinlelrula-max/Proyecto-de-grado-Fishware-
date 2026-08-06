import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff, Shield, CheckCircle, AlertTriangle, Phone, MapPin, Mail, ArrowLeft } from "lucide-react";
import usePerfil from "./hooks/usePerfil";
import { cambiarContrasena } from "./services/perfil.api";

export default function Perfil() {
  const navigate = useNavigate();
  const { perfil, guardarPerfil } = usePerfil();

  const [form, setForm]           = useState({});
  const [passwords, setPasswords] = useState({ actual: "", nueva: "" });
  const [showActual, setShowActual] = useState(false);
  const [showNueva, setShowNueva]   = useState(false);
  const [savedMsg, setSavedMsg]   = useState("");
  const [passError, setPassError] = useState("");

  useEffect(() => { setForm(perfil); }, [perfil]);

  const handleSubmit = (e) => {
    e.preventDefault();
    guardarPerfil(form);
    setSavedMsg("perfil");
    setTimeout(() => setSavedMsg(""), 3000);
  };

  const handlePassword = async () => {
    setPassError("");
    if (!passwords.actual || !passwords.nueva) {
      setPassError("Completa ambos campos.");
      return;
    }
    if (passwords.nueva.length < 6) {
      setPassError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    const token = localStorage.getItem("token");
    try {
      await cambiarContrasena(passwords.actual, passwords.nueva, token);
      setPasswords({ actual: "", nueva: "" });
      setSavedMsg("password");
      setTimeout(() => setSavedMsg(""), 3000);
    } catch (err) {
      setPassError(err.response?.data?.error || "Error al cambiar contraseña.");
    }
  };

  const iniciales = `${form.nombre?.charAt(0) || ""}${form.apellido?.charAt(0) || ""}`.toUpperCase() || "U";

  return (
    <div style={s.page}>
      <div style={s.layout}>

        {/* ── SIDEBAR ── */}
        <aside style={s.sidebar}>
          <button style={s.backBtn} onClick={() => navigate("/dashboard")}>
            <ArrowLeft size={14} />
            Volver al panel
          </button>

          <div style={s.avatarWrap}>
            <div style={s.avatar}>{iniciales}</div>
            <div style={s.avatarRing} />
          </div>

          <div style={s.sidebarMeta}>
            <h2 style={s.sidebarName}>{form.nombre} {form.apellido}</h2>
            <p style={s.sidebarEmail}>{form.usuario}</p>
          </div>

          <div style={s.sidebarBadge}>
            <User size={12} color="#2563eb" />
            Usuario activo
          </div>

          <div style={s.sidebarDivider} />

          <div style={s.sidebarInfo}>
            {form.telefono && (
              <div style={s.sidebarInfoRow}>
                <Phone size={14} color="#94a3b8" style={{ flexShrink: 0 }} />
                <span style={s.sidebarInfoText}>{form.telefono}</span>
              </div>
            )}
            {form.usuario && (
              <div style={s.sidebarInfoRow}>
                <Mail size={14} color="#94a3b8" style={{ flexShrink: 0 }} />
                <span style={s.sidebarInfoText}>{form.usuario}</span>
              </div>
            )}
            {form.direccion && (
              <div style={s.sidebarInfoRow}>
                <MapPin size={14} color="#94a3b8" style={{ flexShrink: 0 }} />
                <span style={s.sidebarInfoText}>{form.direccion}</span>
              </div>
            )}
          </div>

          <div style={s.sidebarDivider} />

          <div style={s.sidebarSection}>
            <p style={s.sidebarSectionLabel}>Número de documento</p>
            <p style={s.sidebarSectionValue}>{form.numero_documento || "—"}</p>
          </div>
        </aside>

        {/* ── CONTENT ── */}
        <main style={s.content}>
          <div style={s.contentHeader}>
            <h1 style={s.contentTitle}>Mi perfil</h1>
            <p style={s.contentSub}>Gestiona tu información personal y seguridad de la cuenta</p>
          </div>

          <div style={s.cardsGrid}>

            {/* INFORMACIÓN PERSONAL */}
            <div style={s.card}>
              <div style={s.cardHeader}>
                <div style={s.cardIconWrap}>
                  <User size={16} color="#2563eb" />
                </div>
                <div>
                  <h3 style={s.cardTitle}>Información personal</h3>
                  <p style={s.cardSubtitle}>Actualiza tus datos de perfil</p>
                </div>
              </div>

              {savedMsg === "perfil" && (
                <div style={s.successBox}>
                  <CheckCircle size={14} style={{ flexShrink: 0 }} />
                  Perfil actualizado correctamente
                </div>
              )}

              <div style={s.fieldsGrid}>
                <Field label="Nombre">
                  <input style={s.input} value={form.nombre || ""} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Juan" />
                </Field>
                <Field label="Apellido">
                  <input style={s.input} value={form.apellido || ""} onChange={(e) => setForm({ ...form, apellido: e.target.value })} placeholder="García" />
                </Field>
                <Field label="Correo electrónico" full>
                  <input style={s.input} value={form.usuario || ""} onChange={(e) => setForm({ ...form, usuario: e.target.value })} placeholder="admin@empresa.com" type="email" />
                </Field>
                <Field label="Teléfono">
                  <input style={s.input} value={form.telefono || ""} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="+57 300 000 0000" />
                </Field>
                <Field label="Número de documento">
                  <input style={{ ...s.input, ...s.inputDisabled }} value={form.numero_documento || ""} disabled placeholder="—" />
                </Field>
                <Field label="Dirección" full>
                  <input style={s.input} value={form.direccion || ""} onChange={(e) => setForm({ ...form, direccion: e.target.value })} placeholder="Calle 123 #45-67" />
                </Field>
              </div>

              <button style={s.btnPrimary} onClick={handleSubmit}>Guardar cambios</button>
            </div>

            {/* SEGURIDAD */}
            <div style={s.card}>
              <div style={s.cardHeader}>
                <div style={s.cardIconWrap}>
                  <Lock size={16} color="#2563eb" />
                </div>
                <div>
                  <h3 style={s.cardTitle}>Seguridad</h3>
                  <p style={s.cardSubtitle}>Cambia tu contraseña de acceso</p>
                </div>
              </div>

              {savedMsg === "password" && (
                <div style={s.successBox}>
                  <CheckCircle size={14} style={{ flexShrink: 0 }} />
                  Contraseña actualizada correctamente
                </div>
              )}
              {passError && (
                <div style={s.errorBox}>
                  <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                  {passError}
                </div>
              )}

              <div style={s.secFields}>
                <Field label="Contraseña actual">
                  <div style={s.passWrap}>
                    <input style={{ ...s.input, paddingRight: "40px" }} type={showActual ? "text" : "password"} placeholder="••••••••" value={passwords.actual} onChange={(e) => setPasswords({ ...passwords, actual: e.target.value })} />
                    <button style={s.eyeBtn} onClick={() => setShowActual(!showActual)} type="button">
                      {showActual ? <EyeOff size={15} color="#94a3b8" /> : <Eye size={15} color="#94a3b8" />}
                    </button>
                  </div>
                </Field>
                <Field label="Nueva contraseña">
                  <div style={s.passWrap}>
                    <input style={{ ...s.input, paddingRight: "40px" }} type={showNueva ? "text" : "password"} placeholder="••••••••" value={passwords.nueva} onChange={(e) => setPasswords({ ...passwords, nueva: e.target.value })} />
                    <button style={s.eyeBtn} onClick={() => setShowNueva(!showNueva)} type="button">
                      {showNueva ? <EyeOff size={15} color="#94a3b8" /> : <Eye size={15} color="#94a3b8" />}
                    </button>
                  </div>
                </Field>

                {passwords.nueva.length > 0 && (
                  <div style={s.strengthWrap}>
                    <div style={s.strengthBar}>
                      {[1, 2, 3, 4].map((n) => (
                        <div key={n} style={{ ...s.strengthSegment, backgroundColor: getStrengthColor(passwords.nueva, n) }} />
                      ))}
                    </div>
                    <span style={{ fontSize: "11px", color: "#64748b" }}>{getStrengthLabel(passwords.nueva)}</span>
                  </div>
                )}
              </div>

              <button style={s.btnPrimary} onClick={handlePassword}>Actualizar contraseña</button>

              <div style={s.sessionInfo}>
                <Shield size={14} color="#2563eb" style={{ flexShrink: 0 }} />
                <span style={s.sessionText}>Tu sesión está protegida con token seguro</span>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

function Field({ label, children, full }) {
  return (
    <div style={{ gridColumn: full ? "1 / -1" : "span 1" }}>
      <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function getStrength(pwd) {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
}

function getStrengthColor(pwd, segment) {
  const score = getStrength(pwd);
  if (segment > score) return "#e2e8f0";
  if (score === 1) return "#ef4444";
  if (score === 2) return "#f59e0b";
  if (score === 3) return "#3b82f6";
  return "#15803d";
}

function getStrengthLabel(pwd) {
  const score = getStrength(pwd);
  return ["", "Débil", "Regular", "Buena", "Fuerte"][score] || "";
}

const s = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f0f4f8",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  layout: {
    display: "flex",
    minHeight: "100vh",
  },

  // ── Sidebar ──
  backBtn: {
    display: "flex", alignItems: "center", gap: "6px",
    width: "100%", padding: "8px 12px",
    background: "none", border: "1px solid #e2e8f0",
    borderRadius: "9px", cursor: "pointer",
    fontSize: "13px", fontWeight: "600", color: "#475569",
    marginBottom: "28px",
  },
  sidebar: {
    width: "260px",
    flexShrink: 0,
    backgroundColor: "white",
    borderRight: "1px solid #e2e8f0",
    padding: "40px 24px 32px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0px",
  },
  avatarWrap: { position: "relative", flexShrink: 0, marginBottom: "16px" },
  avatar: {
    width: "80px", height: "80px", borderRadius: "50%",
    backgroundColor: "#2563eb", color: "white",
    fontSize: "26px", fontWeight: "800",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  avatarRing: {
    position: "absolute", inset: "-4px",
    borderRadius: "50%", border: "2px solid #bfdbfe",
    pointerEvents: "none",
  },
  sidebarMeta: { textAlign: "center", marginBottom: "12px" },
  sidebarName: { fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: "0 0 4px" },
  sidebarEmail: { fontSize: "12px", color: "#94a3b8", margin: 0, wordBreak: "break-all" },
  sidebarBadge: {
    display: "flex", alignItems: "center", gap: "5px",
    padding: "5px 14px", borderRadius: "999px",
    backgroundColor: "#eff6ff", color: "#2563eb",
    fontSize: "12px", fontWeight: "600",
    marginBottom: "24px",
  },
  sidebarDivider: {
    width: "100%", height: "1px",
    backgroundColor: "#f1f5f9",
    margin: "0 0 20px",
  },
  sidebarInfo: {
    width: "100%",
    display: "flex", flexDirection: "column", gap: "12px",
    marginBottom: "24px",
  },
  sidebarInfoRow: {
    display: "flex", alignItems: "flex-start", gap: "10px",
  },
  sidebarInfoText: {
    fontSize: "13px", color: "#475569", lineHeight: "1.4",
    wordBreak: "break-all",
  },
  sidebarSection: { width: "100%", textAlign: "left" },
  sidebarSectionLabel: { fontSize: "11px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" },
  sidebarSectionValue: { fontSize: "14px", color: "#0f172a", fontWeight: "500" },

  // ── Content ──
  content: {
    flex: 1,
    padding: "36px 40px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    minWidth: 0,
  },
  contentHeader: { marginBottom: "4px" },
  contentTitle: { fontSize: "22px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.02em", margin: "0 0 4px" },
  contentSub: { fontSize: "13px", color: "#64748b", margin: 0 },

  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
    alignItems: "start",
  },

  // ── Cards ──
  card: {
    backgroundColor: "white", borderRadius: "16px",
    border: "1px solid #e2e8f0", padding: "24px",
    display: "flex", flexDirection: "column", gap: "20px",
  },
  cardHeader: { display: "flex", alignItems: "center", gap: "12px" },
  cardIconWrap: {
    width: "38px", height: "38px", borderRadius: "10px",
    backgroundColor: "#eff6ff",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  cardTitle: { fontSize: "15px", fontWeight: "700", color: "#0f172a", margin: "0 0 2px" },
  cardSubtitle: { fontSize: "12px", color: "#94a3b8", margin: 0 },

  successBox: {
    display: "flex", alignItems: "center", gap: "8px",
    backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0",
    borderRadius: "10px", padding: "10px 14px",
    fontSize: "13px", color: "#15803d", fontWeight: "500",
  },
  errorBox: {
    display: "flex", alignItems: "center", gap: "8px",
    backgroundColor: "#fef2f2", border: "1px solid #fecaca",
    borderRadius: "10px", padding: "10px 14px",
    fontSize: "13px", color: "#b91c1c", fontWeight: "500",
  },

  fieldsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" },
  secFields: { display: "flex", flexDirection: "column", gap: "14px" },
  input: {
    width: "100%", padding: "10px 12px",
    borderRadius: "9px", border: "1.5px solid #e2e8f0",
    fontSize: "14px", color: "#0f172a", backgroundColor: "white",
    outline: "none", boxSizing: "border-box",
  },
  inputDisabled: { backgroundColor: "#f8fafc", color: "#94a3b8", cursor: "not-allowed" },

  passWrap: { position: "relative" },
  eyeBtn: {
    position: "absolute", right: "10px", top: "50%",
    transform: "translateY(-50%)",
    background: "none", border: "none",
    cursor: "pointer", padding: 0,
    display: "flex", alignItems: "center",
  },

  strengthWrap: { display: "flex", alignItems: "center", gap: "8px" },
  strengthBar: { display: "flex", gap: "4px", flex: 1 },
  strengthSegment: { flex: 1, height: "4px", borderRadius: "999px", transition: "background-color 0.2s" },

  btnPrimary: {
    width: "100%", padding: "12px",
    backgroundColor: "#2563eb", color: "white",
    border: "none", borderRadius: "10px",
    fontSize: "14px", fontWeight: "700", cursor: "pointer",
  },

  sessionInfo: {
    display: "flex", alignItems: "center", gap: "8px",
    padding: "10px 14px", borderRadius: "10px",
    backgroundColor: "#eff6ff", border: "1px solid #bfdbfe",
  },
  sessionText: { fontSize: "12px", color: "#2563eb" },
};
