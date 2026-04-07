const API = "http://localhost:3000/api";

import axios from "axios"

export const register = async (data, token) => {
  const res = await fetch(`${API}/usuarios`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // importante
    },
    body: JSON.stringify(data),
  });

  return res.json();
}

const API_URL = "http://localhost:3000/api"; // Cambia según tu backend

// 🔹 Registro empresa + admin
export const registroEmpresa = async (data) => {
  try {
    const res = await axios.post(`${API_URL}/empresa/registro`, data);
    return res.data;
  } catch (error) {
    return error.response?.data || { error: "Error en registro" };
  }
};

// 🔹 Login
export const loginEmpresa = async (data) => {
  try {
    const res = await axios.post(`${API_URL}/auth/login`, data);
    return res.data;
  } catch (error) {
    return error.response?.data || { error: "Error en login" };
  }
};

export const login = async (data) => {
  try {
    const res = await axios.post(`${API_URL}/usuarios/login`, data);
    return res.data;
  } catch (error) {
    return error.response?.data || { error: "Error en login de usuario" };
  }
};

export const getProductos = async (token) => {
  try {
    const res = await axios.get(`${API_URL}/productos`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    return [];
  }
};

export const agregarProducto = async (data, token) => {
  try {
    const res = await axios.post(`${API_URL}/productos`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    return { error: "No se pudo agregar el producto" };
  }
};

export const agregarCliente = async (data, token) => {
  try {
    const res = await axios.post(`${API_URL}/usuarios`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    return { error: "No se pudo agregar el cliente" };
  }
};

export const getClientes = async (token) => {
  try {
    const res = await axios.get(`${API_URL}/usuarios`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    return [];
  }
};

// 🔹 Obtener todas las ventas de la empresa
export const getVentas = async (token) => {
  try {
    const res = await axios.get(`${API_URL}/ventas`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    return [];
  }
};