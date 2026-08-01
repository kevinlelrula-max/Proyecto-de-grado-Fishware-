import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto
} from "../services/productos.api";

export default function useProductos() {
  const [productos, setProductos] = useState([]);
  const token = localStorage.getItem("token");

  const cargarProductos = async () => {
    const data = await getProductos(token);
    setProductos(data);
  };

  const agregar = async (producto) => {
    try {
      await crearProducto(producto, token);
      await cargarProductos();
      toast.success("Producto creado correctamente");
      return true;
    } catch {
      toast.error("Error al crear el producto");
      return false;
    }
  };

  const actualizar = async (id, data) => {
    try {
      await actualizarProducto(id, data, token);
      await cargarProductos();
      toast.success("Producto actualizado correctamente");
      return true;
    } catch {
      toast.error("Error al actualizar el producto");
      return false;
    }
  };

  const eliminar = async (id) => {
    try {
      await eliminarProducto(id, token);
      await cargarProductos();
      toast.success("Producto eliminado");
      return true;
    } catch {
      toast.error("Error al eliminar el producto");
      return false;
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  return { productos, agregar, actualizar, eliminar };
}