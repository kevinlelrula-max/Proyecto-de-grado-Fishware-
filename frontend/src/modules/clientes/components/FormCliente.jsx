import { useState, useEffect } from "react";

export default function FormCliente({ onGuardar, clienteSeleccionado }) {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    usuario: "",
    contrasena: "",
    telefono: "",
    direccion: "",
    numero_documento: "",
    id_municipio: 11001
  });

  useEffect(() => {
    if (clienteSeleccionado) {
      setForm({ ...clienteSeleccionado, contrasena: "" });
    }
  }, [clienteSeleccionado]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGuardar(form);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow">
      <h3 className="font-bold mb-3">
        {clienteSeleccionado ? "Editar Cliente" : "Nuevo Cliente"}
      </h3>

      <input name="nombre" placeholder="Nombre" onChange={handleChange} className="input" />
      <input name="apellido" placeholder="Apellido" onChange={handleChange} className="input" />
      <input name="usuario" placeholder="Email" onChange={handleChange} className="input" />

      {!clienteSeleccionado && (
        <input name="contrasena" placeholder="Contraseña" onChange={handleChange} className="input" />
      )}

      <input name="telefono" placeholder="Teléfono" onChange={handleChange} className="input" />
      <input name="direccion" placeholder="Dirección" onChange={handleChange} className="input" />
      <input name="numero_documento" placeholder="Documento" onChange={handleChange} className="input" />

      <button className="bg-green-500 text-white px-4 py-2 rounded mt-3">
        Guardar
      </button>
    </form>
  );
}