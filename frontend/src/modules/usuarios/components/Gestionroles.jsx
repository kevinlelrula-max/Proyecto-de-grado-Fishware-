import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  KeyRound, Plus, Pencil, X, Check,
  Package, Users, DollarSign, BarChart2, UserCog, ShoppingCart, Settings,
} from "lucide-react";
import { crearRol } from "../services/usuarios.api";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

const ROLES_FIJOS = [1, 2, 3, 4];

const TODAS_LAS_SECCIONES = [
  { key: "productos",     label: "Productos",       Icon: Package },
  { key: "clientes",      label: "Clientes",        Icon: Users },
  { key: "ventas",        label: "Ventas",          Icon: DollarSign },
  { key: "reportes",      label: "Reportes",        Icon: BarChart2 },
  { key: "usuarios",      label: "Usuarios",        Icon: UserCog },
  { key: "pos",           label: "Punto de venta",  Icon: ShoppingCart },
  { key: "configuracion", label: "Configuración",   Icon: Settings },
];

const COLORES = [
  { color: "#dc2626", bg: "#fef2f2" },
  { color: "#1d4ed8", bg: "#eff6ff" },
  { color: "#15803d", bg: "#f0fdf4" },
  { color: "#7c3aed", bg: "#f5f3ff" },
  { color: "#b45309", bg: "#fffbeb" },
  { color: "#0891b2", bg: "#ecfeff" },
];

const PERMISOS_DESCRIPCION = {
  1: ["Acceso total al sistema", "Gestión de todas las empresas", "Crear y eliminar roles"],
  2: ["Gestión completa de la empresa", "Productos, clientes, ventas, reportes", "Gestión de usuarios y configuración"],
  3: ["Punto de venta", "Gestión de clientes"],
  4: ["Vista de catálogo", "Historial de sus compras"],
};

function puedeEditar(rolUsuario, rolId) {
  if (rolId === 1) return false;
  if (rolUsuario === 1) return true;
  if (rolUsuario === 2 && rolId !== 2) return true;
  return false;
}

export default function Gestionroles() {
  const token      = localStorage.getItem("token");
  const rolUsuario = Number(JSON.parse(atob(token.split(".")[1]))?.rol_id);

  const [roles, setRoles]         = useState([]);
  const [cargando, setCargando]   = useState(true);
  const [nuevoRol, setNuevoRol]   = useState("");
  const [guardando, setGuardando] = useState(false);

  const [rolEditando, setRolEditando]           = useState(null);
  const [permisosEditando, setPermisosEditando] = useState([]);
  const [guardandoPermisos, setGuardandoPermisos] = useState(false);

  const cargar = async () => {
    setCargando(true);
    try {
      const res  = await fetch(`${API}/api/usuarios/roles/todos`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setRoles(data);
    } catch (e) { console.error(e); }
    finally { setCargando(false); }
  };

  useEffect(() => { cargar(); }, []);

  const handleCrear = async (e) => {
    e.preventDefault();
    if (!nuevoRol.trim()) return;
    setGuardando(true);
    try {
      const creado = await crearRol({ nombre: nuevoRol }, token);
      setRoles([...roles, creado]);
      setNuevoRol("");
    } catch (error) {
      toast.error(error.response?.data?.error || "Error al crear rol");
    } finally { setGuardando(false); }
  };

  const abrirEditor = async (rol) => {
    if (rolEditando?.id === rol.id) { setRolEditando(null); return; }
    setRolEditando(rol);
    try {
      const res  = await fetch(`${API}/api/usuarios/roles/${rol.id}/permisos`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setPermisosEditando(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); setPermisosEditando([]); }
  };

  const togglePermiso = (seccion) => {
    setPermisosEditando(prev =>
      prev.includes(seccion) ? prev.filter(s => s !== seccion) : [...prev, seccion]
    );
  };

  const guardarPermisos = async () => {
    setGuardandoPermisos(true);
    try {
      const res = await fetch(`${API}/api/usuarios/roles/${rolEditando.id}/permisos`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ secciones: permisosEditando }),
      });
      if (!res.ok) { const err = await res.json(); toast.error(err.error || "Error al guardar"); return; }
      toast.success(`Permisos de "${rolEditando.nombre}" actualizados`);
      setRolEditando(null);
    } catch (e) { toast.error("Error al guardar permisos"); }
    finally { setGuardandoPermisos(false); }
  };

  return (
    <div style={s.wrap}>

      {/* Info banner */}
      <div style={s.infoBox}>
        <div style={s.infoIconWrap}>
          <KeyRound size={16} color="#2563eb" />
        </div>
        <div>
          <div style={s.infoTitle}>Gestión de roles y permisos</div>
          <div style={s.infoText}>
            El rol <strong>SuperAdmin</strong> no puede modificarse. Los demás roles base y personalizados pueden configurarse según las necesidades de tu empresa.
          </div>
        </div>
      </div>

      {/* Nuevo rol */}
      {(rolUsuario === 1 || rolUsuario === 2) && (
        <div style={s.card}>
          <div style={s.cardHeader}>
            <div style={s.cardIconWrap}>
              <Plus size={15} color="#2563eb" />
            </div>
            <h3 style={s.cardTitle}>Nuevo rol personalizado</h3>
          </div>
          <form style={s.form} onSubmit={handleCrear}>
            <input
              style={s.input}
              placeholder="Ej: Supervisor, Bodeguero, Contador..."
              value={nuevoRol}
              onChange={e => setNuevoRol(e.target.value)}
            />
            <button style={s.btnCrear} type="submit" disabled={guardando || !nuevoRol.trim()}>
              {guardando ? "Guardando..." : "Crear rol"}
            </button>
          </form>
        </div>
      )}

      {/* Lista de roles */}
      <div style={s.card}>
        <h3 style={s.cardTitle}>Roles del sistema</h3>

        {cargando ? (
          <div style={s.spinner}>Cargando roles...</div>
        ) : (
          roles.map((rol, i) => {
            const color    = COLORES[i % COLORES.length];
            const esFijo   = ROLES_FIJOS.includes(rol.id);
            const permisos = PERMISOS_DESCRIPCION[rol.id];
            const editando = rolEditando?.id === rol.id;
            const editable = puedeEditar(rolUsuario, rol.id);

            const etiqueta = rol.id === 1
              ? { label: "SuperAdmin — protegido", style: s.rolSuperBadge }
              : esFijo
                ? { label: "Rol base", style: s.rolFijoBadge }
                : { label: "Personalizado", style: s.rolPersonalizado };

            return (
              <div key={rol.id} style={s.rolItem}>
                <div style={{ ...s.rolAvatar, background: color.bg, color: color.color }}>
                  {rol.nombre.charAt(0)}
                </div>

                <div style={s.rolInfo}>
                  <div style={s.rolHeader}>
                    <span style={s.rolNombre}>{rol.nombre}</span>
                    <span style={etiqueta.style}>{etiqueta.label}</span>

                    {editable && (
                      <button
                        style={{ ...s.btnEditar, ...(editando ? s.btnEditarActivo : {}) }}
                        onClick={() => abrirEditor(rol)}
                      >
                        {editando
                          ? <><X size={11} /> Cerrar</>
                          : <><Pencil size={11} /> Editar permisos</>
                        }
                      </button>
                    )}
                  </div>

                  {/* Permisos fijos (solo lectura) */}
                  {permisos && !editando && (
                    <div style={s.permisosList}>
                      {permisos.map((p, j) => (
                        <span key={j} style={s.permisoItem}>
                          <Check size={11} color="#15803d" />
                          {p}
                        </span>
                      ))}
                    </div>
                  )}

                  {!permisos && !editando && (
                    <div style={s.permisosList}>
                      <span style={{ fontSize: 12, color: "#94a3b8" }}>
                        {editable
                          ? 'Haz clic en "Editar permisos" para configurar el acceso de este rol'
                          : "Sin permisos configurados"}
                      </span>
                    </div>
                  )}

                  {/* Editor de permisos */}
                  {editando && (
                    <div style={s.editorPermisos}>
                      <div style={s.editorTitle}>Selecciona las secciones a las que tendrá acceso:</div>
                      <div style={s.checkGrid}>
                        {TODAS_LAS_SECCIONES.map(sec => {
                          const activo = permisosEditando.includes(sec.key);
                          return (
                            <label
                              key={sec.key}
                              style={{ ...s.checkLabel, ...(activo ? s.checkLabelActivo : {}) }}
                            >
                              <input
                                type="checkbox"
                                checked={activo}
                                onChange={() => togglePermiso(sec.key)}
                                style={s.checkbox}
                              />
                              <sec.Icon size={14} color={activo ? "#2563eb" : "#94a3b8"} />
                              <span style={{ ...s.checkText, color: activo ? "#1d4ed8" : "#0f172a" }}>
                                {sec.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                      <div style={s.editorFooter}>
                        <span style={s.editorHint}>
                          {permisosEditando.length} sección{permisosEditando.length !== 1 ? "es" : ""} seleccionada{permisosEditando.length !== 1 ? "s" : ""}
                        </span>
                        <button style={s.btnGuardarPermisos} onClick={guardarPermisos} disabled={guardandoPermisos}>
                          {guardandoPermisos ? "Guardando..." : "Guardar permisos"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const s = {
  wrap: { display: "flex", flexDirection: "column", gap: "16px", marginTop: "4px" },

  infoBox: {
    display: "flex", gap: "12px", alignItems: "flex-start",
    background: "#eff6ff", border: "1px solid #bfdbfe",
    borderRadius: "12px", padding: "14px 16px",
  },
  infoIconWrap: {
    width: "34px", height: "34px", borderRadius: "9px",
    backgroundColor: "white", border: "1px solid #bfdbfe",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  infoTitle: { fontSize: "13px", fontWeight: "600", color: "#1d4ed8", marginBottom: "3px" },
  infoText:  { fontSize: "12px", color: "#3b82f6", lineHeight: 1.5 },

  card: {
    background: "#fff", border: "1px solid #e2e8f0",
    borderRadius: "14px", padding: "20px",
  },
  cardHeader: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" },
  cardIconWrap: {
    width: "32px", height: "32px", borderRadius: "8px",
    backgroundColor: "#eff6ff",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  cardTitle: { fontSize: "14px", fontWeight: "600", color: "#0f172a", margin: 0 },

  form:  { display: "flex", gap: "10px" },
  input: {
    flex: 1, padding: "9px 14px", border: "1px solid #e2e8f0",
    borderRadius: "9px", fontSize: "13px", outline: "none", color: "#0f172a",
    boxSizing: "border-box",
  },
  btnCrear: {
    padding: "9px 20px", background: "#2563eb",
    border: "none", borderRadius: "9px", color: "#fff",
    fontSize: "13px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap",
  },

  rolItem: {
    display: "flex", alignItems: "flex-start", gap: "12px",
    padding: "14px 0", borderBottom: "1px solid #f1f5f9",
  },
  rolAvatar: {
    width: "38px", height: "38px", borderRadius: "10px",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "15px", fontWeight: "700", flexShrink: 0, marginTop: "2px",
  },
  rolInfo:   { flex: 1, display: "flex", flexDirection: "column", gap: "8px" },
  rolHeader: { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" },
  rolNombre: { fontSize: "14px", fontWeight: "600", color: "#0f172a" },

  rolSuperBadge:  { fontSize: "10px", padding: "2px 8px", borderRadius: "99px", background: "#fef9c3", color: "#854d0e", fontWeight: "500" },
  rolFijoBadge:   { fontSize: "10px", padding: "2px 8px", borderRadius: "99px", background: "#f1f5f9", color: "#64748b", fontWeight: "500" },
  rolPersonalizado:{ fontSize: "10px", padding: "2px 8px", borderRadius: "99px", background: "#f0fdf4", color: "#16a34a", fontWeight: "500" },

  btnEditar: {
    display: "flex", alignItems: "center", gap: "4px",
    padding: "4px 10px", fontSize: "11px", fontWeight: "500",
    border: "1px solid #e2e8f0", borderRadius: "7px",
    background: "#f8fafc", color: "#64748b", cursor: "pointer",
    marginLeft: "auto",
  },
  btnEditarActivo: { background: "#fef2f2", borderColor: "#fecaca", color: "#dc2626" },

  permisosList: { display: "flex", flexDirection: "column", gap: "4px" },
  permisoItem:  { fontSize: "12px", color: "#15803d", display: "flex", alignItems: "center", gap: "5px" },

  editorPermisos: {
    background: "#f8fafc", border: "1px solid #e2e8f0",
    borderRadius: "10px", padding: "14px",
  },
  editorTitle: { fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "12px" },
  checkGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: "8px", marginBottom: "14px",
  },
  checkLabel: {
    display: "flex", alignItems: "center", gap: "8px",
    padding: "8px 10px", borderRadius: "8px",
    background: "#fff", border: "1px solid #e2e8f0",
    cursor: "pointer", transition: "all 0.12s",
  },
  checkLabelActivo: {
    background: "#eff6ff", borderColor: "#bfdbfe",
  },
  checkbox:  { width: "15px", height: "15px", accentColor: "#2563eb", cursor: "pointer" },
  checkText: { fontSize: "13px" },

  editorFooter: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  editorHint:   { fontSize: "12px", color: "#94a3b8" },
  btnGuardarPermisos: {
    padding: "8px 16px", background: "#2563eb",
    border: "none", borderRadius: "8px",
    color: "#fff", fontSize: "12px", fontWeight: "600",
    cursor: "pointer",
  },

  spinner: { padding: "24px", textAlign: "center", color: "#94a3b8", fontSize: "13px" },
};
