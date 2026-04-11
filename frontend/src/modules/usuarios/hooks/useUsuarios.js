import { useEffect, useState } from "react";
import { getUsuarios, crearUsuario } from "../services/usuarios.api";

export default function useUsuarios() {
  const [usuarios, setUsuarios] = useState([]);

  const token = localStorage.getItem("token");

  const cargarUsuarios = async () => {
    const data = await getUsuarios(token);
    setUsuarios(data);
  };

  const agregarUsuario = async (usuario) => {
    await crearUsuario(usuario, token);
    cargarUsuarios();
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  return { usuarios, agregarUsuario };
}