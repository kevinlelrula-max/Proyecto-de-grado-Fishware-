import { useState, useEffect, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

function getToken() {
  return localStorage.getItem("token");
}

export function useInicio() {
  const [resumen, setResumen]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  const nombreUsuario = (() => {
    try {
      const token = getToken();
      if (!token) return "Usuario";
      return JSON.parse(atob(token.split(".")[1]))?.usuario || "Usuario";
    } catch { return "Usuario"; }
  })();

  // ── Saludo según hora del día
  const saludo = (() => {
    const hora = new Date().getHours();
    if (hora < 12) return "Buenos días";
    if (hora < 18) return "Buenas tardes";
    return "Buenas noches";
  })();

  const fetchResumen = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
    
    const res = await fetch(`${API_BASE}/api/reportesEmpresa/inicio`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResumen(data);
    } catch {
      setError("No se pudo cargar el resumen.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResumen();
    const intervalo = setInterval(fetchResumen, 60_000); // refresca cada 60s
    return () => clearInterval(intervalo);
  }, [fetchResumen]);

  // ── Onboarding: usar objeto completo del backend
  const onboarding          = resumen?.onboarding || null;
  const esOnboardingCompleto = resumen?.onboarding?.completo ?? false;

  // Compatibilidad: empresa nueva si el onboarding aún no está completo
  const esEmpresaNueva = resumen ? !esOnboardingCompleto : false;

  return {
    resumen,
    loading,
    error,
    saludo,
    nombreUsuario,
    onboarding,
    esOnboardingCompleto,
    esEmpresaNueva,
    refetch: fetchResumen,
  };
}