import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  KeyRound, Plus, Pencil, Check, Lock,
  Package, Users, DollarSign, BarChart2, UserCog, ShoppingCart, Settings,
} from "lucide-react";
import { crearRol } from "../services/usuarios.api";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";
const ROLES_FIJOS = [1, 2, 3, 4];

const SECCIONES = [
  { key: "productos",     label: "Productos",      Icon: Package },
  { key: "clientes",      label: "Clientes",       Icon: Users },
  { key: "ventas",        label: "Ventas",         Icon: DollarSign },
  { key: "reportes",      label: "Reportes",       Icon: BarChart2 },
  { key: "usuarios",      label: "Usuarios",       Icon: UserCog },
  { key: "pos",           label: "Punto de venta", Icon: ShoppingCart },
  { key: "configuracion", label: "Configuración",  Icon: Settings },
];

const DESC_FIJOS = {
  1: "Acceso total al sistema, todas las empresas y configuración global.",
  2: "Gestión completa: productos, ventas, clientes, reportes, usuarios y configuración.",
  3: "Punto de venta y atención a clientes.",
  4: "Vista de catálogo e historial de compras propias.",
};

const PALETA = [
  { color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
  { color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
  { color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
  { color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
  { color: "#b45309", bg: "#fffbeb", border: "#fde68a" },
  { color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc" },
];

function puedeEditar(rolUsuario, rolId) {
  if (rolId === 1) return false;
  if (rolUsuario === 1) return true;
  if (rolUsuario === 2 && rolId !== 2) return true;
  return false;
}

export default function Gestionroles() {
  const token      = localStorage.getItem("token");
  const rolUsuario = Number(JSON.parse(atob(token.split(".")[1]))?.rol_id);

  const [roles, setRoles]             = useState([]);
  const [cargando, setCargando]       = useState(true);
  const [permisosMap, setPermisosMap] = useState({});
  const [nuevoVisible, setNuevoVisible] = useState(false);
  const [nuevoRol, setNuevoRol]       = useState("");
  const [guardando, setGuardando]     = useState(false);
  const [rolEditando, setRolEditando] = useState(null);
  const [permisosEd, setPermisosEd]   = useState([]);
  const [guardandoP, setGuardandoP]   = useState(false);

  const cargar = async () => {
    setCargando(true);
    try {
      const res  = await fetch(`${API}/api/usuarios/roles/todos`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setRoles(data);

      const entries = await Promise.all(
        data.map(async (rol) => {
          try {
            const r = await fetch(`${API}/api/usuarios/roles/${rol.id}/permisos`, { headers: { Authorization: `Bearer ${token}` } });
            const p = await r.json();
            return [rol.id, Array.isArray(p) ? p : []];
          } catch { return [rol.id, []]; }
        })
      );
      setPermisosMap(Object.fromEntries(entries));
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
      setRoles(prev => [...prev, creado]);
      setPermisosMap(prev => ({ ...prev, [creado.id]: [] }));
      setNuevoRol("");
      setNuevoVisible(false);
    } catch (err) {
      toast.error(err.response?.data?.error || "Error al crear rol");
    } finally { setGuardando(false); }
  };

  const abrirEditor = (rol) => {
    if (rolEditando?.id === rol.id) { setRolEditando(null); return; }
    setRolEditando(rol);
    setPermisosEd([...(permisosMap[rol.id] || [])]);
  };

  const togglePermiso = (key) =>
    setPermisosEd(prev => prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]);

  const guardarPermisos = async () => {
    setGuardandoP(true);
    try {
      const res = await fetch(`${API}/api/usuarios/roles/${rolEditando.id}/permisos`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ secciones: permisosEd }),
      });
      if (!res.ok) { const err = await res.json(); toast.error(err.error || "Error"); return; }
      setPermisosMap(prev => ({ ...prev, [rolEditando.id]: [...permisosEd] }));
      toast.success(`Permisos de "${rolEditando.nombre}" guardados`);
      setRolEditando(null);
    } catch { toast.error("Error al guardar permisos"); }
    finally { setGuardandoP(false); }
  };

  return (
    <div style={s.wrap}>

      {/* Banner informativo */}
      <div style={s.banner}>
        <div style={s.bannerIcon}><KeyRound size={18} color="#2563eb" /></div>
        <div style={s.bannerBody}>
          <p style={s.bannerTitle}>Roles y permisos del sistema</p>
          <p style={s.bannerText}>
            Define qué puede ver y hacer cada tipo de usuario. El rol <strong>SuperAdmin</strong> no puede modificarse para proteger el acceso al sistema.
          </p>
        </div>
        {(rolUsuario === 1 || rolUsuario === 2) && (
          <button style={s.btnNuevo} onClick={() => setNuevoVisible(!nuevoVisible)}>
            <Plus size={14} />
            Nuevo rol
          </button>
        )}
      </div>

      {/* Formulario nuevo rol */}
      {nuevoVisible && (
        <div style={s.nuevoCard}>
          <p style={s.nuevoLabel}>Nombre del nuevo rol personalizado</p>
          <form style={s.nuevoRow} onSubmit={handleCrear}>
            <input
              autoFocus
              style={s.input}
              placeholder="Ej: Supervisor, Bodeguero, Contador..."
              value={nuevoRol}
              onChange={e => setNuevoRol(e.target.value)}
            />
            <button style={s.btnCrear} type="submit" disabled={guardando || !nuevoRol.trim()}>
              {guardando ? "Creando..." : "Crear rol"}
            </button>
            <button type="button" style={s.btnCancelNuevo} onClick={() => { setNuevoVisible(false); setNuevoRol(""); }}>
              Cancelar
            </button>
          </form>
        </div>
      )}

      {/* Grid de roles */}
      {cargando ? (
        <div style={s.spinner}>Cargando roles...</div>
      ) : (
        <div style={s.grid}>
          {roles.map((rol, i) => {
            const pal      = PALETA[i % PALETA.length];
            const esFijo   = ROLES_FIJOS.includes(rol.id);
            const esBlind  = rol.id === 1;
            const editable = puedeEditar(rolUsuario, rol.id);
            const editando = rolEditando?.id === rol.id;
            const permisos = permisosMap[rol.id] || [];
            const seccionesActivas = SECCIONES.filter(s => permisos.includes(s.key));

            return (
              <div key={rol.id} style={{ ...s.card, borderTop: `3px solid ${pal.color}` }}>

                {/* Cabecera de la card */}
                <div style={s.cardTop}>
                  <div style={{ ...s.avatar, backgroundColor: pal.bg, color: pal.color }}>
                    {rol.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div style={s.cardMeta}>
                    <span style={s.rolNombre}>{rol.nombre}</span>
                    <span style={{
                      ...s.tipoBadge,
                      backgroundColor: esBlind ? "#fef9c3" : esFijo ? "#f1f5f9" : "#f0fdf4",
                      color: esBlind ? "#854d0e" : esFijo ? "#64748b" : "#16a34a",
                    }}>
                      {esBlind ? "Protegido" : esFijo ? "Rol base" : "Personalizado"}
                    </span>
                  </div>
                </div>

                {/* Cuerpo — permisos en read mode */}
                {!editando && (
                  <div style={s.cardBody}>
                    {DESC_FIJOS[rol.id] ? (
                      <p style={s.descText}>{DESC_FIJOS[rol.id]}</p>
                    ) : seccionesActivas.length > 0 ? (
                      <div style={s.chipsWrap}>
                        {seccionesActivas.map(sec => (
                          <span key={sec.key} style={{ ...s.chip, backgroundColor: pal.bg, color: pal.color, borderColor: pal.border }}>
                            <sec.Icon size={10} />
                            {sec.label}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p style={s.noPermisos}>
                        {editable ? "Sin permisos — haz clic en Editar para configurar" : "Sin permisos asignados"}
                      </p>
                    )}
                  </div>
                )}

                {/* Editor de permisos */}
                {editando && (
                  <div style={s.editor}>
                    <p style={s.editorLabel}>Selecciona las secciones accesibles:</p>
                    <div style={s.toggleGrid}>
                      {SECCIONES.map(sec => {
                        const on = permisosEd.includes(sec.key);
                        return (
                          <button
                            key={sec.key}
                            type="button"
                            style={{ ...s.toggleBtn, ...(on ? s.toggleOn : {}) }}
                            onClick={() => togglePermiso(sec.key)}
                          >
                            <sec.Icon size={14} color={on ? "#2563eb" : "#94a3b8"} />
                            <span style={{ flex: 1, color: on ? "#1d4ed8" : "#64748b", fontSize: "13px" }}>{sec.label}</span>
                            {on && <Check size={12} color="#2563eb" />}
                          </button>
                        );
                      })}
                    </div>
                    <div style={s.editorFooter}>
                      <span style={s.editorCount}>{permisosEd.length} sección{permisosEd.length !== 1 ? "es" : ""}</span>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button style={s.btnCancelEd} onClick={() => setRolEditando(null)}>Cancelar</button>
                        <button style={s.btnGuardar} onClick={guardarPermisos} disabled={guardandoP}>
                          {guardandoP ? "Guardando..." : "Guardar"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer de la card */}
                <div style={s.cardFooter}>
                  {esBlind ? (
                    <span style={s.lockMsg}><Lock size={11} color="#854d0e" /> No modificable</span>
                  ) : editable && !editando ? (
                    <button style={s.btnEditar} onClick={() => abrirEditor(rol)}>
                      <Pencil size={12} />
                      Editar permisos
                    </button>
                  ) : editando ? null : (
                    <span style={s.noEditMsg}>Solo lectura</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const s = {
  wrap: { display: "flex", flexDirection: "column", gap: "20px" },

  banner: {
    display: "flex", alignItems: "center", gap: "14px",
    backgroundColor: "#eff6ff", border: "1px solid #bfdbfe",
    borderRadius: "14px", padding: "16px 20px",
  },
  bannerIcon: {
    width: "44px", height: "44px", borderRadius: "12px",
    backgroundColor: "white", border: "1px solid #bfdbfe",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  bannerBody: { flex: 1 },
  bannerTitle:{ fontSize: "14px", fontWeight: "700", color: "#1d4ed8", margin: "0 0 3px" },
  bannerText: { fontSize: "12px", color: "#3b82f6", margin: 0, lineHeight: 1.5 },
  btnNuevo: {
    display: "flex", alignItems: "center", gap: "6px",
    padding: "8px 16px", backgroundColor: "#2563eb", color: "white",
    border: "none", borderRadius: "9px", cursor: "pointer",
    fontSize: "13px", fontWeight: "600", flexShrink: 0,
  },

  nuevoCard: {
    backgroundColor: "white", border: "1px solid #e2e8f0",
    borderRadius: "14px", padding: "20px",
  },
  nuevoLabel: { fontSize: "12px", fontWeight: "600", color: "#374151", margin: "0 0 10px" },
  nuevoRow:   { display: "flex", gap: "10px" },
  input: {
    flex: 1, padding: "9px 14px", border: "1px solid #e2e8f0",
    borderRadius: "9px", fontSize: "13px", outline: "none",
    color: "#0f172a", boxSizing: "border-box",
  },
  btnCrear: {
    padding: "9px 20px", backgroundColor: "#2563eb", color: "white",
    border: "none", borderRadius: "9px", fontSize: "13px",
    fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap",
  },
  btnCancelNuevo: {
    padding: "9px 16px", backgroundColor: "transparent",
    border: "1px solid #e2e8f0", borderRadius: "9px",
    color: "#64748b", fontSize: "13px", cursor: "pointer", whiteSpace: "nowrap",
  },

  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },

  card: {
    backgroundColor: "white", borderRadius: "14px",
    border: "1px solid #e2e8f0",
    display: "flex", flexDirection: "column", overflow: "hidden",
  },
  cardTop: {
    display: "flex", alignItems: "center", gap: "12px",
    padding: "20px 20px 16px",
  },
  avatar: {
    width: "46px", height: "46px", borderRadius: "12px",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "20px", fontWeight: "800", flexShrink: 0,
  },
  cardMeta: { display: "flex", flexDirection: "column", gap: "5px" },
  rolNombre: { fontSize: "15px", fontWeight: "700", color: "#0f172a" },
  tipoBadge: {
    display: "inline-block", fontSize: "10px", fontWeight: "600",
    padding: "2px 8px", borderRadius: "99px", width: "fit-content",
  },

  cardBody: { padding: "0 20px 16px", flex: 1 },
  descText: { fontSize: "12px", color: "#64748b", margin: 0, lineHeight: 1.6 },
  chipsWrap: { display: "flex", flexWrap: "wrap", gap: "6px" },
  chip: {
    display: "inline-flex", alignItems: "center", gap: "4px",
    padding: "4px 10px", borderRadius: "999px", border: "1px solid",
    fontSize: "11px", fontWeight: "600",
  },
  noPermisos: { fontSize: "12px", color: "#94a3b8", margin: 0, fontStyle: "italic" },

  editor: {
    margin: "0 16px 16px",
    backgroundColor: "#f8fafc", border: "1px solid #e2e8f0",
    borderRadius: "10px", padding: "14px",
  },
  editorLabel: { fontSize: "12px", fontWeight: "600", color: "#64748b", margin: "0 0 10px" },
  toggleGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "12px" },
  toggleBtn: {
    display: "flex", alignItems: "center", gap: "8px",
    padding: "8px 10px", borderRadius: "8px",
    backgroundColor: "white", border: "1.5px solid #e2e8f0",
    cursor: "pointer", transition: "all 0.12s",
  },
  toggleOn: { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" },
  editorFooter: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  editorCount: { fontSize: "11px", color: "#94a3b8" },
  btnCancelEd: {
    padding: "6px 12px", background: "transparent",
    border: "1px solid #e2e8f0", borderRadius: "7px",
    color: "#64748b", fontSize: "12px", cursor: "pointer",
  },
  btnGuardar: {
    padding: "6px 14px", backgroundColor: "#2563eb",
    border: "none", borderRadius: "7px",
    color: "white", fontSize: "12px", fontWeight: "600", cursor: "pointer",
  },

  cardFooter: {
    borderTop: "1px solid #f1f5f9",
    padding: "12px 20px",
    display: "flex", alignItems: "center",
    backgroundColor: "#fafafa",
  },
  btnEditar: {
    display: "flex", alignItems: "center", gap: "5px",
    padding: "5px 12px", fontSize: "12px", fontWeight: "500",
    border: "1px solid #e2e8f0", borderRadius: "7px",
    backgroundColor: "white", color: "#475569", cursor: "pointer",
  },
  lockMsg: {
    display: "flex", alignItems: "center", gap: "5px",
    fontSize: "11px", color: "#854d0e",
  },
  noEditMsg: { fontSize: "11px", color: "#94a3b8" },

  spinner: { padding: "48px", textAlign: "center", color: "#94a3b8", fontSize: "13px" },
};
