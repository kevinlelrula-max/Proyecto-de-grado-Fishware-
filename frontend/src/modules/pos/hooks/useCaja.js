import { useState, useCallback } from "react";
import { getSesionActiva, getHistorialCaja, abrirCaja, cerrarCaja } from "../services/caja.api";
import { listarVentasHoy } from "../services/pos.api";

export function useCaja(token) {
  const [ventas,    setVentas]    = useState([]);
  const [sesion,    setSesion]    = useState(null);
  const [historial, setHistorial] = useState([]);
  const [cargando,  setCargando]  = useState(true);
  const [msg,       setMsg]       = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const [ventasData, sesionData, histData] = await Promise.allSettled([
        listarVentasHoy(token),
        getSesionActiva(),
        getHistorialCaja(),
      ]);

      if (ventasData.status === "fulfilled") {
        const lista = Array.isArray(ventasData.value)
          ? ventasData.value
          : ventasData.value?.ventas || ventasData.value?.data || [];
        const hoy   = new Date();
        const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        setVentas(lista.filter(v => new Date(v.created_at || v.fecha) >= inicio));
      }

      setSesion(sesionData.status === "fulfilled" ? sesionData.value : null);
      setHistorial(histData.status === "fulfilled" ? histData.value.slice(0, 10) : []);
    } finally {
      setCargando(false);
    }
  }, [token]);

  const handleAbrir = useCallback(async (monto_apertura) => {
    try {
      await abrirCaja(monto_apertura);
      setMsg({ tipo: "ok", texto: "Caja abierta correctamente" });
      await cargar();
      return true;
    } catch (err) {
      setMsg({ tipo: "error", texto: err.message });
      return false;
    }
  }, [cargar]);

  const handleCerrar = useCallback(async (sesion_id, monto_cierre, observaciones) => {
    try {
      await cerrarCaja(sesion_id, monto_cierre, observaciones);
      setMsg({ tipo: "ok", texto: "Caja cerrada y registrada" });
      await cargar();
      return true;
    } catch (err) {
      setMsg({ tipo: "error", texto: err.message });
      return false;
    }
  }, [cargar]);

  const limpiarMsg = useCallback(() => setMsg(null), []);

  const totalDia    = ventas.reduce((a, v) => a + Number(v.total || 0), 0);
  const totalVentas = ventas.length;
  const promedio    = totalVentas ? totalDia / totalVentas : 0;
  const porMetodo   = ventas.reduce((acc, v) => {
    const m = v.metodo_pago || "Otro";
    acc[m] = (acc[m] || 0) + Number(v.total || 0);
    return acc;
  }, {});

  return {
    cargando, sesion, historial,
    totalDia, totalVentas, promedio, porMetodo,
    msg, limpiarMsg,
    cargar, handleAbrir, handleCerrar,
  };
}
