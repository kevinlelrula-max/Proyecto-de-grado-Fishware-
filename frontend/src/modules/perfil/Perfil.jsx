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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-gray-200 flex justify-center py-10 px-4">

      <div className="w-full max-w-3xl space-y-6">

        {/* 🔥 HEADER PERFIL */}
        <div className="bg-white rounded-2xl shadow p-6 flex items-center gap-5">
          
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-cyan-500 flex items-center justify-center text-white text-2xl font-bold shadow">
            {form.nombre?.charAt(0) || "U"}
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {form.nombre} {form.apellido}
            </h2>
            <p className="text-gray-500 text-sm">
              {form.usuario}
            </p>
          </div>

        </div>

        {/* 🧾 PERFIL */}
        <div className="bg-white rounded-2xl shadow p-6">

          <h3 className="text-lg font-semibold mb-5 text-gray-700">
            Información personal
          </h3>

          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">

            <input
              className="input-pro"
              value={form.nombre || ""}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Nombre"
            />

            <input
              className="input-pro"
              value={form.apellido || ""}
              onChange={(e) => setForm({ ...form, apellido: e.target.value })}
              placeholder="Apellido"
            />

            <input
              className="input-pro col-span-2"
              value={form.usuario || ""}
              onChange={(e) => setForm({ ...form, usuario: e.target.value })}
              placeholder="Correo / Usuario"
            />

            <input
              className="input-pro"
              value={form.telefono || ""}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              placeholder="Teléfono"
            />

            <input
              className="input-pro"
              value={form.numero_documento || ""}
              disabled
              placeholder="Documento"
            />

            <input
              className="input-pro col-span-2"
              value={form.direccion || ""}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              placeholder="Dirección"
            />

            <button className="col-span-2 bg-cyan-600 text-white py-3 rounded-xl font-semibold hover:bg-cyan-700 transition shadow">
              Guardar cambios
            </button>

          </form>
        </div>

        {/* 🔐 SEGURIDAD */}
        <div className="bg-white rounded-2xl shadow p-6">

          <h3 className="text-lg font-semibold mb-5 text-gray-700">
            Seguridad
          </h3>

          <div className="grid gap-4">

            <input
              type="password"
              className="input-pro"
              placeholder="Contraseña actual"
              onChange={(e) =>
                setPasswords({ ...passwords, actual: e.target.value })
              }
            />

            <input
              type="password"
              className="input-pro"
              placeholder="Nueva contraseña"
              onChange={(e) =>
                setPasswords({ ...passwords, nueva: e.target.value })
              }
            />

            <button className="bg-red-500 text-white py-2 rounded-xl hover:bg-red-600 transition font-semibold shadow">
              Cambiar contraseña
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}