import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getClientes,
  crearCliente,
  actualizarCliente,
  eliminarCliente
} from "../services/clientes.api";

export default function useClientes() {
  const [clientes, setClientes] = useState([]);

  const token = localStorage.getItem("token");

  const cargarClientes = async () => {
    const data = await getClientes(token);
    setClientes(data);
  };

  const agregarCliente = async (cliente) => {
    try {
      await crearCliente(cliente, token);
      await cargarClientes();
      toast.success("Cliente registrado correctamente");
      return true;
    } catch {
      toast.error("Error al registrar el cliente");
      return false;
    }
  };

  const editarCliente = async (id, cliente) => {
    try {
      await actualizarCliente(id, cliente, token);
      await cargarClientes();
      toast.success("Cliente actualizado correctamente");
      return true;
    } catch {
      toast.error("Error al actualizar el cliente");
      return false;
    }
  };

  const borrarCliente = async (id) => {
    try {
      await eliminarCliente(id, token);
      await cargarClientes();
      toast.success("Cliente eliminado");
      return true;
    } catch {
      toast.error("Error al eliminar el cliente");
      return false;
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  return {
    clientes,
    agregarCliente,
    editarCliente,
    borrarCliente
  };
}