import { useParams } from "react-router-dom";
import { usePerfilCliente } from "./hooks/usePerfilCliente";
import DatosPersonales from "./components/DatosPersonales";
import CambiarContrasena from "./components/CambiarContrasena";
import NivelLealtad from "./components/NivelLealtad";
import SeccionReferido from "../referidos/components/SeccionReferido";

export default function PerfilCliente() {
  const { empresaSlug } = useParams();

  // Obtener empresaId desde localStorage
  const ultimaEmpresa = (() => {
    try { return JSON.parse(localStorage.getItem("ultima_empresa") || "null"); }
    catch { return null; }
  })();
  const empresaId = ultimaEmpresa?.id || null;

  const token = localStorage.getItem("cliente_token");

  const {
    perfil, loading, error,
    form, guardando, exitoDatos,
    formPass, guardandoPass, exitoPass, errorPass,
    nivelLealtad,
    handleChange, guardarDatos,
    handleChangePass, cambiarContrasena,
  } = usePerfilCliente(empresaId);

  if (loading) {
    return (
      <div style={s.loading}>
        <span style={s.loadingIcon}>👤</span>
        <p style={s.loadingText}>Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div style={s.page}>

      {/* Header */}
      <div style={s.header}>
        <div style={s.headerAvatar}>
          {perfil?.nombre?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 style={s.title}>
            {perfil?.nombre} {perfil?.apellido}
          </h2>
          <p style={s.subtitle}>{perfil?.usuario}</p>
        </div>
      </div>

      {/* Contenido */}
      <div style={s.grid}>
        <div style={s.colLeft}>
          <DatosPersonales
            perfil={perfil}
            form={form}
            guardando={guardando}
            exito={exitoDatos}
            error={error}
            onChange={handleChange}
            onGuardar={guardarDatos}
          />
          <CambiarContrasena
            formPass={formPass}
            guardando={guardandoPass}
            exito={exitoPass}
            error={errorPass}
            onChange={handleChangePass}
            onGuardar={cambiarContrasena}
          />
        </div>
        <div style={s.colRight}>
          <NivelLealtad nivelLealtad={nivelLealtad} />
          <div style={s.seccionReferido}>
            <h3 style={s.seccionTitulo}>🤝 Programa de referidos</h3>
            <SeccionReferido
              token={token}
              empresaId={empresaId}
              empresaSlug={empresaSlug}
              colorMarca={ultimaEmpresa?.color_primario || "#00C9A7"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "32px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  headerAvatar: {
    width: "64px", height: "64px",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #00C9A7, #0099FF)",
    color: "white",
    fontSize: "24px", fontWeight: "700",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  title: {
    fontSize: "22px", fontWeight: "800",
    color: "#0f172a", letterSpacing: "-0.02em",
    marginBottom: "4px",
  },
  subtitle: { fontSize: "14px", color: "#64748b" },
  grid: {
    display: "grid",
    gridTemplateColumns: "1.3fr 1fr",
    gap: "20px",
    alignItems: "start",
  },
  colLeft: { display: "flex", flexDirection: "column", gap: "20px" },
  colRight: { display: "flex", flexDirection: "column", gap: "20px" },
  seccionReferido: {
    background: "#fff",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    padding: "20px",
  },
  seccionTitulo: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0 0 16px",
  },
  loading: {
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: "12px",
    padding: "80px",
  },
  loadingIcon: { fontSize: "40px" },
  loadingText: { fontSize: "14px", color: "#94a3b8" },
};