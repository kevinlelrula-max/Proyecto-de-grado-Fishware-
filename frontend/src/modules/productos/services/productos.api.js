import axios from "axios";

const API = "http://localhost:3000/api/productos";

export const getProductos = async (token) => {
  const res = await axios.get(API, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const crearProducto = async (data, token) => {
  const res = await axios.post(API, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const actualizarProducto = async (id, data, token) => {
  const res = await axios.put(`${API}/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const eliminarProducto = async (id, token) => {
  const res = await axios.delete(`${API}/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};