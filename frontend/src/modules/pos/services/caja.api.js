const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` };
}

export async function getSesionActiva() {
  const res = await fetch(`${BASE_URL}/api/caja/activa`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Error al obtener sesión activa");
  return res.json();
}

export async function getHistorialCaja() {
  const res = await fetch(`${BASE_URL}/api/caja/historial`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Error al obtener historial de caja");
  return res.json();
}

export async function abrirCaja(monto_apertura) {
  const res = await fetch(`${BASE_URL}/api/caja/abrir`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ monto_apertura: Number(monto_apertura) }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al abrir caja");
  return data;
}

export async function cerrarCaja(sesion_id, monto_cierre, observaciones) {
  const res = await fetch(`${BASE_URL}/api/caja/cerrar`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ sesion_id, monto_cierre: Number(monto_cierre), observaciones }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al cerrar caja");
  return data;
}
