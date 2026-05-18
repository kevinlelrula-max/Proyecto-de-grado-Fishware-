import { useState, useEffect, useCallback } from "react";
import { getMisPedidos, getEstadoPedido } from "../../../services/api";

const POLL_INTERVAL = 30000; // 30 segundos

// Estados con color y label visual
export const ESTADOS = {
  pendiente:       { label: "Pendiente",       color: "#f59e0b", bg: "#fffbeb", icon: "⏳" },
  confirmado:      { label: "Confirmado",      color: "#3b82f6", bg: "#eff6ff", icon: "✅" },
  en_preparacion:  { label: "En preparación",  color: "#8b5cf6", bg: "#f5f3ff", icon: "🔄" },
  enviado:         { label: "Enviado",          color: "#0e7490", bg: "#ecfeff", icon: "🚚" },
  entregado:       { label: "Entregado",        color: "#0F6E56", bg: "#E1F5EE", icon: "🎉" },
  cancelado:       { label: "Cancelado",        color: "#ef4444", bg: "#fef2f2", icon: "❌" },
};

export function useMisPedidos() {
  const [pedidos, setPedidos]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  const clienteToken  = localStorage.getItem("cliente_token");
  const clienteNombre = localStorage.getItem("cliente_nombre");
  const estaLogueado  = !!clienteToken;

  // Cargar todos los pedidos
  const fetchPedidos = useCallback(async () => {
    if (!clienteToken) return;
    try {
      const data = await getMisPedidos(clienteToken);
      setPedidos(data);
    } catch {
      setError("No se pudieron cargar los pedidos.");
    } finally {
      setLoading(false);
    }
  }, [clienteToken]);

  // Carga inicial
  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  // Polling — actualiza estado de pedidos activos cada 30 seg
  useEffect(() => {
    if (!clienteToken) return;

    const interval = setInterval(async () => {
      // Solo hacer polling de pedidos que no estén finalizados
      const pedidosActivos = pedidos.filter(
        (p) => !["entregado", "cancelado"].includes(p.estado)
      );

      if (pedidosActivos.length === 0) return;

      // Actualizar estado de cada pedido activo
      const actualizaciones = await Promise.all(
        pedidosActivos.map((p) => getEstadoPedido(p.id, clienteToken))
      );

      setPedidos((prev) =>
        prev.map((pedido) => {
          const actualizado = actualizaciones.find(
            (a) => a && a.id === pedido.id
          );
          if (actualizado && actualizado.estado !== pedido.estado) {
            return { ...pedido, estado: actualizado.estado, fecha_actualizacion: actualizado.fecha_actualizacion };
          }
          return pedido;
        })
      );
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [clienteToken, pedidos]);

  return {
    pedidos,
    loading,
    error,
    estaLogueado,
    clienteNombre,
    refetch: fetchPedidos,
  };
}