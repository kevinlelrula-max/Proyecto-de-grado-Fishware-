import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import Inicio from "../modules/inicio/Inicio";
import Productos from "../modules/productos/Productos";
import Clientes from "../modules/clientes/Clientes";
import Usuarios from "../modules/usuarios/Usuarios";
import Ventas from "../pages/VentasEmpresa";
import Reportes from "../pages/Reportes";
import PuntoDeVenta from "../modules/pos/PuntoDeVenta";
import Configuracion from "../modules/configuracion/Configuracion";
import NivelesLealtad from "../modules/lealtad/NivelesLealtad";
import BtnSoporte from "../components/BtnSoporte";
import Mensajes from "../modules/tienda/Mensajes";
import EditorTienda from "../modules/personalizacion/EditorTienda";
import Integraciones from "../modules/integraciones/Integraciones";
import PedidosOnline from "../modules/pedidos/PedidosOnline";
import Cupones       from "../modules/cupones/Cupones";
import Reseñas       from "../modules/reseñas/Reseñas";
import Referidos     from "../modules/referidos/Referidos";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const PERMISOS_BASE = {
  1: ["inicio","productos","clientes","ventas","reportes","usuarios","pos","configuracion","lealtad","cupones","reseñas","referidos","editor","mensajes","integraciones","pedidos"],
  2: ["inicio","productos","clientes","ventas","reportes","usuarios","pos","configuracion","lealtad","cupones","reseñas","referidos","editor","mensajes","integraciones","pedidos"],
  3: ["inicio","pos","clientes"],
  4: [],
};

const TODO_EL_MENU = [
  { key: "inicio",        label: "Inicio",          icon: InicioIcon },
  { key: "productos",     label: "Productos",        icon: ProductosIcon },
  { key: "clientes",      label: "Clientes",         icon: ClientesIcon },
  { key: "ventas",        label: "Ventas",           icon: VentasIcon },
  { key: "reportes",      label: "Reportes",         icon: ReportesIcon },
  { key: "usuarios",      label: "Usuarios",         icon: UsuariosIcon },
  { key: "pos",           label: "Punto de venta",   icon: PosIcon },
  { key: "editor",        label: "Editor de tienda", icon: EditorIcon },
  { key: "lealtad",       label: "Lealtad",          icon: LealtadIcon },
  { key: "cupones",       label: "Cupones",          icon: CuponesIcon },
  { key: "reseñas",       label: "Reseñas",          icon: ReseñasIcon },
  { key: "referidos",    label: "Referidos",        icon: ReferidosIcon },
  { key: "mensajes",      label: "Mensajes",         icon: MensajesIcon },
  { key: "integraciones", label: "Integraciones",    icon: IntegracionesIcon },
  { key: "pedidos",       label: "Pedidos online",   icon: PedidosIcon }, // ✅ NUEVO
];

function decodeToken(token) {
  try { return JSON.parse(atob(token.split(".")[1])); }
  catch { return null; }
}

// ── Íconos SVG ───────────────────────────────────────────────────────────────
function InicioIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#7A8BA0"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}
function ProductosIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#7A8BA0"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  );
}
function ClientesIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#7A8BA0"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
function VentasIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#7A8BA0"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  );
}
function ReportesIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#7A8BA0"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  );
}
function UsuariosIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#7A8BA0"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  );
}
function PosIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#7A8BA0"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <path d="M8 21h8M12 17v4"/>
      <path d="M7 8h.01M11 8h.01M15 8h.01M7 12h.01M11 12h.01M15 12h.01"/>
    </svg>
  );
}
function EditorIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#7A8BA0"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <path d="M3 9h18M9 21V9"/>
    </svg>
  );
}
function LealtadIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#7A8BA0"} strokeWidth="1.8" strokeLinecap="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  );
}
function MensajesIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#7A8BA0"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}
function IntegracionesIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#7A8BA0"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="3"/>
      <circle cx="5" cy="19" r="3"/>
      <circle cx="19" cy="19" r="3"/>
      <line x1="12" y1="8" x2="5" y2="16"/>
      <line x1="12" y1="8" x2="19" y2="16"/>
    </svg>
  );
}
function CuponesIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#7A8BA0"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 5H3a2 2 0 0 0-2 2v3a2 2 0 0 1 0 4v3a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2v-3a2 2 0 0 1 0-4V7a2 2 0 0 0-2-2z"/>
      <line x1="9" y1="9" x2="9" y2="9.01"/>
      <line x1="15" y1="15" x2="15" y2="15.01"/>
      <line x1="9" y1="15" x2="15" y2="9"/>
    </svg>
  );
}
function ReseñasIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#7A8BA0"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}
function PedidosIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#7A8BA0"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  );
}
function ReferidosIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#7A8BA0"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      <line x1="19" y1="8" x2="23" y2="8"/>
      <line x1="21" y1="6" x2="21" y2="10"/>
    </svg>
  );
}
function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}
function ChevronIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}

// ── Campana de notificaciones ────────────────────────────────────────────────
const TIPO_META = {
  nuevo_pedido:     { emoji: "🛍️", color: "#3B82F6" },
  stock_bajo:       { emoji: "⚠️", color: "#F59E0B" },
  nuevo_cliente:    { emoji: "👤", color: "#10B981" },
  pedido_entregado: { emoji: "✅", color: "#00C9A7" },
  pedido_cancelado: { emoji: "❌", color: "#EF4444" },
  cupon_por_vencer: { emoji: "🎟️", color: "#8B5CF6" },
};

function formatRelativo(fechaStr) {
  const diff = Date.now() - new Date(fechaStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "Ahora";
  if (mins < 60) return `Hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `Hace ${hrs}h`;
  return `Hace ${Math.floor(hrs / 24)}d`;
}

function NotificacionesBell({ token, irA }) {
  const [notifs, setNotifs]   = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [openBell, setOpenBell] = useState(false);
  const ref = useRef(null);

  const fetchNotifs = useCallback(() => {
    if (!token) return;
    fetch(`${BASE_URL}/api/notificaciones`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        setNotifs(data.notificaciones || []);
        setNoLeidas(data.no_leidas || 0);
      })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    fetchNotifs();
    const iv = setInterval(fetchNotifs, 30_000);
    return () => clearInterval(iv);
  }, [fetchNotifs]);

  // click fuera cierra
  useEffect(() => {
    if (!openBell) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpenBell(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openBell]);

  const marcarLeida = async (id) => {
    await fetch(`${BASE_URL}/api/notificaciones/${id}/leer`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
    setNoLeidas(prev => Math.max(0, prev - 1));
  };

  const marcarTodas = async () => {
    await fetch(`${BASE_URL}/api/notificaciones/leer-todas`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
    setNotifs(prev => prev.map(n => ({ ...n, leida: true })));
    setNoLeidas(0);
  };

  const limpiarLeidas = async () => {
    await fetch(`${BASE_URL}/api/notificaciones/limpiar-leidas`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
    setNotifs(prev => prev.filter(n => !n.leida));
  };

  const handleClickNotif = (notif) => {
    if (!notif.leida) marcarLeida(notif.id);
    if (notif.seccion) irA(notif.seccion);
    setOpenBell(false);
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpenBell(v => !v)}
        className="fw-notif-btn"
        title="Notificaciones"
      >
        <BellIcon />
        {noLeidas > 0 && (
          <span style={{
            position: "absolute", top: 5, right: 5,
            width: noLeidas > 9 ? 16 : 14, height: 14,
            background: "#EF4444", borderRadius: 999,
            fontSize: 9, fontWeight: 700, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "1.5px solid #F0F4F8", lineHeight: 1,
          }}>
            {noLeidas > 99 ? "99+" : noLeidas}
          </span>
        )}
      </button>

      {openBell && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          width: 340, background: "#fff",
          border: "1px solid rgba(0,0,0,0.08)", borderRadius: 14,
          boxShadow: "0 8px 32px rgba(0,0,0,0.14)", zIndex: 200,
          display: "flex", flexDirection: "column", overflow: "hidden",
          maxHeight: 480,
        }}>
          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px", borderBottom: "1px solid #F0F4F8",
          }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#0B1628" }}>
              Notificaciones
              {noLeidas > 0 && (
                <span style={{
                  marginLeft: 8, background: "#EF4444", color: "#fff",
                  fontSize: 10, fontWeight: 700, borderRadius: 999, padding: "1px 7px",
                }}>{noLeidas}</span>
              )}
            </span>
            {noLeidas > 0 && (
              <button onClick={marcarTodas} style={{
                fontSize: 11, color: "#00A884", background: "none", border: "none",
                cursor: "pointer", fontWeight: 500, padding: 0,
              }}>
                Marcar todas leídas
              </button>
            )}
          </div>

          {/* Lista */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {notifs.length === 0 ? (
              <div style={{
                padding: "32px 16px", textAlign: "center",
                color: "#94A3B8", fontSize: 13,
              }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🔔</div>
                Sin notificaciones
              </div>
            ) : notifs.map(n => {
              const meta = TIPO_META[n.tipo] || { emoji: "📌", color: "#64748b" };
              return (
                <div
                  key={n.id}
                  onClick={() => handleClickNotif(n)}
                  style={{
                    display: "flex", gap: 10, alignItems: "flex-start",
                    padding: "11px 16px",
                    background: n.leida ? "transparent" : "rgba(0,201,167,0.05)",
                    borderBottom: "1px solid #F8FAFC",
                    cursor: "pointer", transition: "background 0.1s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#F5F7FA"}
                  onMouseLeave={e => e.currentTarget.style.background = n.leida ? "transparent" : "rgba(0,201,167,0.05)"}
                >
                  <div style={{
                    width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                    background: `${meta.color}18`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16,
                  }}>
                    {meta.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13, fontWeight: n.leida ? 400 : 600,
                      color: "#0B1628", lineHeight: 1.3,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {n.titulo}
                    </div>
                    {n.mensaje && (
                      <div style={{ fontSize: 12, color: "#64748B", marginTop: 2, lineHeight: 1.4 }}>
                        {n.mensaje}
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 3 }}>
                      {formatRelativo(n.creado_en)}
                    </div>
                  </div>
                  {!n.leida && (
                    <div style={{
                      width: 7, height: 7, borderRadius: "50%",
                      background: "#00C9A7", flexShrink: 0, marginTop: 4,
                    }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          {notifs.some(n => n.leida) && (
            <div style={{ padding: "8px 16px", borderTop: "1px solid #F0F4F8" }}>
              <button onClick={limpiarLeidas} style={{
                fontSize: 12, color: "#94A3B8", background: "none", border: "none",
                cursor: "pointer", width: "100%", textAlign: "center", padding: "4px 0",
              }}>
                Limpiar notificaciones leídas
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function DashboardEmpresa() {
  const navigate      = useNavigate();
  const token         = localStorage.getItem("token");
  const decoded       = decodeToken(token);
  const rolId         = decoded?.rol_id || 3;
  const nombreUsuario = decoded?.usuario || "Usuario";

  const [permisosRol, setPermisosRol]           = useState(null);
  const [cargandoPermisos, setCargandoPermisos] = useState(true);
  const [mensajesNoLeidos, setMensajesNoLeidos] = useState(0);

  useEffect(() => {
    if (!token) return;
    const ROLES_FIJOS = [1, 2, 3, 4];
    if (ROLES_FIJOS.includes(rolId)) {
      setPermisosRol(PERMISOS_BASE[rolId] || []);
      setCargandoPermisos(false);
      return;
    }
    fetch(`${BASE_URL}/api/usuarios/roles/${rolId}/permisos`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => setPermisosRol(Array.isArray(data) ? data : []))
      .catch(() => setPermisosRol([]))
      .finally(() => setCargandoPermisos(false));
  }, [rolId, token]);

  useEffect(() => {
    if (!token) return;
    const fetchNoLeidos = () => {
      fetch(`${BASE_URL}/api/contacto/no-leidos`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => { if (data) setMensajesNoLeidos(data.total); })
        .catch(() => {});
    };
    fetchNoLeidos();
    const interval = setInterval(fetchNoLeidos, 60000);
    return () => clearInterval(interval);
  }, [token]);

  const menu = permisosRol
    ? TODO_EL_MENU.filter(item => permisosRol.includes(item.key))
    : [];

  // ── Qué grupo contiene cada sección ──────────────────────────────────────
  const GRUPOS_DEF = [
    { id: "principal",   label: "Principal",   keys: ["productos","clientes","ventas","reportes"] },
    { id: "operaciones", label: "Operaciones", keys: ["usuarios","pos"] },
    { id: "comercial",   label: "Comercial",   keys: ["editor","lealtad","cupones","reseñas","referidos","mensajes","integraciones","pedidos"] },
  ];

  const grupoDeSeccion = (key) => GRUPOS_DEF.find(g => g.keys.includes(key))?.id || null;

  const [seccion, setSeccion]             = useState(null);
  const [open, setOpen]                   = useState(false);
  const [logoUrl, setLogoUrl]             = useState(null);
  const [nombreEmpresa, setNombreEmpresa] = useState("FishWare");

  // Grupos abiertos — arranca todo abierto
  const [gruposAbiertos, setGruposAbiertos] = useState({
    principal: true, operaciones: true, comercial: true,
  });

  const toggleGrupo = (id) =>
    setGruposAbiertos(prev => ({ ...prev, [id]: !prev[id] }));

  useEffect(() => {
    if (menu.length > 0 && !seccion) setSeccion("inicio");
  }, [menu]);

  useEffect(() => {
    if (!token) return;
    fetch(`${BASE_URL}/api/configuracion`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!data) return;
        if (data.logoUrl) setLogoUrl(data.logoUrl);
        if (data.nombre)  setNombreEmpresa(data.nombre);
        if (data.slug)    localStorage.setItem("empresa_slug", data.slug);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function onConfigGuardada(e) {
      if (e.detail?.logoUrl) setLogoUrl(e.detail.logoUrl);
      if (e.detail?.nombre)  setNombreEmpresa(e.detail.nombre);
    }
    window.addEventListener("configuracion:guardada", onConfigGuardada);
    return () => window.removeEventListener("configuracion:guardada", onConfigGuardada);
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  const irA = (key) => {
    if (permisosRol?.includes(key)) {
      setSeccion(key);
      if (key === "mensajes") setMensajesNoLeidos(0);
      // Auto-abrir el grupo que contiene la sección
      const gid = grupoDeSeccion(key);
      if (gid) setGruposAbiertos(prev => ({ ...prev, [gid]: true }));
    }
  };

  const rolLabel = rolId === 1 ? "SuperAdmin" : rolId === 2 ? "Administrador" : rolId === 3 ? "Empleado" : "Usuario";
  const inicial  = nombreUsuario.charAt(0).toUpperCase();

  if (cargandoPermisos) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#F0F4F8", fontFamily: "'Sora', sans-serif", flexDirection: "column", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, #00C9A7, #0099FF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🐟</div>
        <div style={{ fontSize: 13, color: "#64748b" }}>Cargando permisos...</div>
      </div>
    );
  }

  if (!cargandoPermisos && menu.length === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#F0F4F8", fontFamily: "'Sora', sans-serif", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 32 }}>🔒</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#0f172a" }}>Sin acceso</div>
        <div style={{ fontSize: 13, color: "#64748b" }}>Tu rol no tiene secciones habilitadas.</div>
        <button style={{ marginTop: 8, padding: "8px 20px", background: "linear-gradient(135deg, #00C9A7, #0099FF)", border: "none", borderRadius: 9, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          onClick={() => { localStorage.clear(); navigate("/"); }}>
          Cerrar sesión
        </button>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .fw-shell { display: flex; min-height: 100vh; background: #F0F4F8; font-family: 'Sora', sans-serif; }
        .fw-sidebar { width: 240px; flex-shrink: 0; background: #0B1628; display: flex; flex-direction: column; position: fixed; top: 0; left: 0; bottom: 0; z-index: 40; }
        .fw-sb-top { padding: 24px 20px 20px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .fw-sb-brand { display: flex; align-items: center; gap: 10px; }
        .fw-sb-logo { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #00C9A7, #0099FF); display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
        .fw-sb-name { font-size: 15px; font-weight: 600; color: #E8F4FF; letter-spacing: -0.02em; line-height: 1.2; }
        .fw-sb-sub { font-size: 10px; color: #4A6080; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 2px; }
        .fw-sb-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 2px; overflow-y: auto; }
        .fw-sb-section { font-size: 10px; font-weight: 500; color: #2D4060; text-transform: uppercase; letter-spacing: 0.1em; padding: 10px 8px 6px; margin-top: 4px; }
        .fw-sb-group-hdr { display: flex; align-items: center; justify-content: space-between; padding: 9px 8px 5px; margin-top: 6px; cursor: pointer; border-radius: 7px; transition: background 0.12s; user-select: none; }
        .fw-sb-group-hdr:hover { background: rgba(255,255,255,0.04); }
        .fw-sb-group-label { font-size: 10px; font-weight: 600; color: #2D4060; text-transform: uppercase; letter-spacing: 0.1em; }
        .fw-sb-group-chevron { color: #2D4060; transition: transform 0.2s; flex-shrink: 0; }
        .fw-sb-group-chevron.open { transform: rotate(180deg); }
        .fw-sb-group-body { overflow: hidden; transition: max-height 0.22s ease, opacity 0.18s ease; }
        .fw-sb-group-body.closed { max-height: 0 !important; opacity: 0; }
        .fw-sb-item { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 9px; font-size: 13px; font-weight: 400; color: #5A7090; cursor: pointer; transition: all 0.15s; border: 1px solid transparent; background: none; width: 100%; text-align: left; }
        .fw-sb-item:hover { background: rgba(255,255,255,0.05); color: #C8D6E5; }
        .fw-sb-item.fw-active { background: linear-gradient(135deg, rgba(0,201,167,0.2), rgba(0,153,255,0.12)); border-color: rgba(0,201,167,0.25); color: #fff; font-weight: 500; }
        .fw-sb-item.fw-active .fw-sb-icon { background: linear-gradient(135deg, #00C9A7, #0099FF); border-color: transparent; }
        .fw-sb-icon { width: 30px; height: 30px; border-radius: 7px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.15s; }
        .fw-sb-badge { background: #ef4444; color: white; border-radius: 999px; font-size: 10px; font-weight: 700; padding: 1px 6px; margin-left: auto; }
        .fw-sb-bottom { padding: 16px 12px; border-top: 1px solid rgba(255,255,255,0.06); }
        .fw-sb-user { display: flex; align-items: center; gap: 10px; padding: 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; }
        .fw-sb-avatar { width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, #00C9A7, #0099FF); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; color: #fff; flex-shrink: 0; }
        .fw-sb-uname { font-size: 12px; font-weight: 500; color: #C8D6E5; line-height: 1.3; }
        .fw-sb-urole { font-size: 10px; color: #00C9A7; margin-top: 1px; }
        .fw-main { flex: 1; margin-left: 240px; display: flex; flex-direction: column; min-height: 100vh; }
        .fw-topbar { position: sticky; top: 0; z-index: 30; background: rgba(240,244,248,0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid rgba(0,0,0,0.06); padding: 0 28px; height: 60px; display: flex; align-items: center; justify-content: space-between; }
        .fw-topbar-left { display: flex; align-items: center; gap: 8px; }
        .fw-breadcrumb { font-size: 13px; color: #8A9BB0; }
        .fw-page-title { font-size: 15px; font-weight: 600; color: #0B1628; letter-spacing: -0.02em; }
        .fw-topbar-right { display: flex; align-items: center; gap: 8px; }
        .fw-notif-btn { width: 36px; height: 36px; border-radius: 9px; background: #fff; border: 1px solid rgba(0,0,0,0.08); display: flex; align-items: center; justify-content: center; cursor: pointer; color: #5A7090; position: relative; transition: all 0.15s; padding: 0; }
        .fw-notif-btn:hover { background: #f5f7fa; color: #0B1628; }
        .fw-user-btn { display: flex; align-items: center; gap: 8px; padding: 6px 12px 6px 6px; background: #fff; border: 1px solid rgba(0,0,0,0.08); border-radius: 10px; cursor: pointer; transition: all 0.15s; position: relative; }
        .fw-user-btn:hover { background: #f5f7fa; border-color: rgba(0,0,0,0.12); }
        .fw-user-avatar { width: 28px; height: 28px; border-radius: 7px; background: linear-gradient(135deg, #00C9A7, #0099FF); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; color: #fff; }
        .fw-user-name { font-size: 13px; font-weight: 500; color: #0B1628; }
        .fw-user-chevron { color: #8A9BB0; margin-left: 2px; }
        .fw-dropdown { position: absolute; top: calc(100% + 6px); right: 0; width: 200px; background: #fff; border: 1px solid rgba(0,0,0,0.08); border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); overflow: hidden; z-index: 100; }
        .fw-dropdown-header { padding: 12px 14px; border-bottom: 1px solid #F0F4F8; }
        .fw-dropdown-uname { font-size: 13px; font-weight: 500; color: #0B1628; }
        .fw-dropdown-role { font-size: 11px; color: #00A884; margin-top: 2px; }
        .fw-dropdown-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; font-size: 13px; color: #3D5068; cursor: pointer; transition: background 0.1s; background: none; border: none; width: 100%; text-align: left; }
        .fw-dropdown-item:hover { background: #F5F7FA; color: #0B1628; }
        .fw-dropdown-item.danger { color: #E24B4A; }
        .fw-dropdown-item.danger:hover { background: #FFF0F0; }
        .fw-dropdown-divider { height: 1px; background: #F0F4F8; margin: 4px 0; }
        .fw-content { flex: 1; padding: 24px 28px; }
        .fw-content-card { background: #fff; border-radius: 16px; border: 1px solid rgba(0,0,0,0.06); min-height: calc(100vh - 108px); overflow: hidden; }
        .fw-content-card:has(.editor-fullbleed) { overflow: visible; background: transparent; border: none; box-shadow: none; }
        .fw-soporte-btn { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background-color: #25D366; color: white; border-radius: 999px; font-size: 14px; font-weight: 700; text-decoration: none; position: fixed; bottom: 28px; right: 28px; z-index: 999; box-shadow: 0 4px 20px rgba(37,211,102,0.4); transition: transform 0.2s, box-shadow 0.2s; }
        .fw-soporte-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(37,211,102,0.5); }
      `}</style>

      <div className="fw-shell">

        {/* ── SIDEBAR ── */}
        <aside className="fw-sidebar">
          <div className="fw-sb-top">
            <div className="fw-sb-brand">
              {logoUrl ? (
                <img src={`${BASE_URL}${logoUrl}`} alt="Logo"
                  style={{ width: 36, height: 36, borderRadius: 10, objectFit: "contain", background: "#fff", padding: 2 }}
                />
              ) : (
                <div className="fw-sb-logo">🐟</div>
              )}
              <div>
                <div className="fw-sb-name">{nombreEmpresa}</div>
                <div className="fw-sb-sub">Panel de gestión</div>
              </div>
            </div>
          </div>

          <nav className="fw-sb-nav">

            {/* ── INICIO (sin grupo) ── */}
            {menu.filter(i => i.key === "inicio").map(item => {
              const Icon = item.icon;
              const active = seccion === item.key;
              return (
                <button key={item.key} className={`fw-sb-item ${active ? "fw-active" : ""}`} onClick={() => irA(item.key)}>
                  <div className="fw-sb-icon"><Icon active={active} /></div>
                  {item.label}
                </button>
              );
            })}

            {/* ── GRUPOS COLAPSABLES ── */}
            {GRUPOS_DEF.map(grupo => {
              const items = menu.filter(i => grupo.keys.includes(i.key));
              if (items.length === 0) return null;
              const abierto = gruposAbiertos[grupo.id] !== false;
              const maxH = abierto ? "600px" : "0px";
              // indicador de sección activa dentro del grupo cuando está cerrado
              const itemActivo = !abierto && items.find(i => i.key === seccion);

              return (
                <div key={grupo.id}>
                  <div className="fw-sb-group-hdr" onClick={() => toggleGrupo(grupo.id)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span className="fw-sb-group-label">{grupo.label}</span>
                      {itemActivo && (
                        <span style={{
                          fontSize: 10, color: "#00C9A7", fontWeight: 500,
                          textTransform: "none", letterSpacing: 0,
                        }}>· {itemActivo.label}</span>
                      )}
                    </div>
                    <svg
                      className={`fw-sb-group-chevron ${abierto ? "open" : ""}`}
                      width="10" height="10" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>

                  <div
                    className={`fw-sb-group-body ${abierto ? "" : "closed"}`}
                    style={{ maxHeight: maxH, opacity: abierto ? 1 : 0 }}
                  >
                    {items.map(item => {
                      const Icon = item.icon;
                      const active = seccion === item.key;
                      return (
                        <button
                          key={item.key}
                          className={`fw-sb-item ${active ? "fw-active" : ""}`}
                          onClick={() => irA(item.key)}
                        >
                          <div className="fw-sb-icon"><Icon active={active} /></div>
                          {item.label}
                          {item.key === "mensajes" && mensajesNoLeidos > 0 && (
                            <span className="fw-sb-badge">{mensajesNoLeidos}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

          </nav>

          <div className="fw-sb-bottom">
            <div className="fw-sb-user">
              <div className="fw-sb-avatar">{inicial}</div>
              <div>
                <div className="fw-sb-uname">{nombreUsuario}</div>
                <div className="fw-sb-urole">{rolLabel}</div>
              </div>
            </div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="fw-main">

          {/* TOPBAR */}
          <div className="fw-topbar">
            <div className="fw-topbar-left">
              <span className="fw-breadcrumb">FishWare</span>
              <span className="fw-breadcrumb" style={{ margin: "0 4px" }}>›</span>
              <span className="fw-page-title">
                {menu.find(m => m.key === seccion)?.label || seccion}
              </span>
            </div>

            <div className="fw-topbar-right">
              <NotificacionesBell token={token} irA={irA} />

              <div className="fw-user-btn" onClick={e => { e.stopPropagation(); setOpen(!open); }}>
                <div className="fw-user-avatar">{inicial}</div>
                <span className="fw-user-name">{nombreUsuario}</span>
                <span className="fw-user-chevron"><ChevronIcon /></span>

                {open && (
                  <div className="fw-dropdown" onClick={e => e.stopPropagation()}>
                    <div className="fw-dropdown-header">
                      <div className="fw-dropdown-uname">{nombreUsuario}</div>
                      <div className="fw-dropdown-role">{rolLabel}</div>
                    </div>
                    <button className="fw-dropdown-item" onClick={() => { setOpen(false); navigate("/perfil"); }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                      Mi perfil
                    </button>
                    {(rolId === 1 || rolId === 2) && (
                      <button className="fw-dropdown-item" onClick={() => { setOpen(false); irA("configuracion"); }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                        Configuración
                      </button>
                    )}
                    <div className="fw-dropdown-divider" />
                    <button className="fw-dropdown-item danger" onClick={() => { localStorage.clear(); navigate("/"); }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CONTENIDO */}
          <div className="fw-content">
            <div className="fw-content-card">
              {seccion === "inicio"        && <Inicio onIrA={irA} />}
              {seccion === "productos"     && <Productos />}
              {seccion === "clientes"      && <Clientes />}
              {seccion === "ventas"        && <Ventas />}
              {seccion === "reportes"      && <Reportes />}
              {seccion === "usuarios"      && <Usuarios />}
              {seccion === "pos"           && <PuntoDeVenta />}
              {seccion === "configuracion" && <Configuracion />}
              {seccion === "editor"        && <EditorTienda />}
              {seccion === "lealtad"       && <NivelesLealtad />}
              {seccion === "cupones"       && <Cupones />}
              {seccion === "reseñas"       && <Reseñas />}
              {seccion === "referidos"     && <Referidos />}
              {seccion === "mensajes"      && <Mensajes />}
              {seccion === "integraciones" && <Integraciones />}
              {seccion === "pedidos"       && <PedidosOnline />} {/* ✅ NUEVO */}
            </div>
          </div>
        </main>

        {/* ── BOTÓN SOPORTE FLOTANTE ── */}
        <BtnSoporte />

      </div>
    </>
  );
}