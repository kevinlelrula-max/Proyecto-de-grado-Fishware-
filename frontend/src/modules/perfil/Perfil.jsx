import { useState, useEffect } from "react";
import usePerfil from "./hooks/usePerfil";

export default function Perfil() {
  const { perfil, guardarPerfil } = usePerfil();

  const [form, setForm] = useState({});
  const [passwords, setPasswords] = useState({
    actual: "",
    nueva: ""
  });

  useEffect(() => {
    setForm(perfil);
  }, [perfil]);

  const handleSubmit = (e) => {
    e.preventDefault();
    guardarPerfil(form);
    alert("Perfil actualizado ✅");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start py-10">

      <div className="w-full max-w-2xl space-y-6">

        {/* 🧾 PERFIL */}
        <div className="bg-white rounded-2xl shadow p-6">

          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            👤 Mi Perfil
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">

            <input
              className="input"
              value={form.nombre || ""}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Nombre"
            />

            <input
              className="input"
              value={form.apellido || ""}
              onChange={(e) => setForm({ ...form, apellido: e.target.value })}
              placeholder="Apellido"
            />

            <input
              className="input col-span-2"
              value={form.usuario || ""}
              onChange={(e) => setForm({ ...form, usuario: e.target.value })}
              placeholder="Correo / Usuario"
            />

            <input
              className="input"
              value={form.telefono || ""}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              placeholder="Teléfono"
            />

            <input
              className="input"
              value={form.numero_documento || ""}
              disabled
              placeholder="Documento"
            />

            <input
              className="input col-span-2"
              value={form.direccion || ""}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              placeholder="Dirección"
            />

            <button className="col-span-2 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition">
              Guardar cambios
            </button>

          </form>
        </div>

        {/* 🔐 CAMBIAR CONTRASEÑA */}
        <div className="bg-white rounded-2xl shadow p-6">

          <h2 className="text-xl font-bold mb-4 text-gray-800">
            🔐 Seguridad
          </h2>

          <div className="flex flex-col gap-3">

            <input
              type="password"
              className="input"
              placeholder="Contraseña actual"
              onChange={(e) =>
                setPasswords({ ...passwords, actual: e.target.value })
              }
            />

            <input
              type="password"
              className="input"
              placeholder="Nueva contraseña"
              onChange={(e) =>
                setPasswords({ ...passwords, nueva: e.target.value })
              }
            />

            <button className="bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition">
              Cambiar contraseña
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}