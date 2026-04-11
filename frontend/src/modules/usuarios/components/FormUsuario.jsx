import { useState } from "react";

export default function FormUsuario({ onGuardar }) {
  const [form, setForm] = useState({
    nombre: "",
    usuario: "",
    contrasena: "",
    rol_id: 4
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onGuardar(form);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-xl mb-4">
      <input
        placeholder="Nombre"
        className="input"
        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
      />

      <input
        placeholder="Usuario"
        className="input"
        onChange={(e) => setForm({ ...form, usuario: e.target.value })}
      />

      <input
        type="password"
        placeholder="Contraseña"
        className="input"
        onChange={(e) => setForm({ ...form, contrasena: e.target.value })}
      />

      <select
        className="input"
        onChange={(e) => setForm({ ...form, rol_id: e.target.value })}
      >
        <option value={2}>Administrador</option>
        <option value={3}>Empleado</option>
        <option value={4}>Cliente</option>
      </select>

      <button className="bg-green-600 text-white px-4 py-2 rounded">
        Guardar
      </button>
    </form>
  );
}