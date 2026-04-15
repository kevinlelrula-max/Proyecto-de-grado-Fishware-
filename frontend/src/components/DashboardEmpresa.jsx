import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Productos from "../modules/productos/Productos";
import Clientes from "../modules/clientes/Clientes";
import Usuarios from "../modules/usuarios/Usuarios";
import Ventas from "../pages/VentasEmpresa";
import Reportes from "../pages/Reportes"; // 🔥 IMPORTANTE

export default function DashboardEmpresa() {
  const [seccion, setSeccion] = useState("productos");
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* 🔷 SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white p-6">
        <h2 className="text-2xl font-bold mb-8">🐟 FishWare</h2>

        <nav className="flex flex-col gap-3">
          <button onClick={() => setSeccion("productos")} className="btn">
            📦 Productos
          </button>

          <button onClick={() => setSeccion("clientes")} className="btn">
            👥 Clientes
          </button>

          <button onClick={() => setSeccion("ventas")} className="btn">
            💰 Ventas
          </button>

          <button onClick={() => setSeccion("reportes")} className="btn">
            📊 Reportes
          </button>

          <button onClick={() => setSeccion("usuarios")} className="btn">
            👥 Usuarios
          </button>
        </nav>
      </aside>

      {/* 🔶 MAIN */}
      <main className="flex-1 flex flex-col">

        {/* 🔥 TOPBAR */}
        <div className="flex justify-between items-center bg-white px-8 py-4 shadow">
          <h1 className="text-2xl font-bold text-gray-800">
            Dashboard
          </h1>

          <div className="relative">
            <div
              onClick={() => setOpen(!open)}
              className="cursor-pointer bg-gray-100 px-4 py-2 rounded-xl hover:bg-gray-200"
            >
              👤 Admin ⬇
            </div>

            {open && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-xl overflow-hidden z-50">

                <button
                  onClick={() => {
                    setOpen(false);
                    navigate("/perfil");
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  👤 Mi perfil
                </button>

                <button className="w-full text-left px-4 py-2 hover:bg-gray-100">
                  ⚙️ Configuración
                </button>

                <button
                  onClick={() => {
                    localStorage.clear();
                    navigate("/");
                  }}
                  className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                >
                  🚪 Cerrar sesión
                </button>

              </div>
            )}
          </div>
        </div>

        {/* 📦 CONTENIDO */}
        <div className="p-8">
          <div className="bg-white p-6 rounded-xl shadow">

            {seccion === "productos" && <Productos />}
            {seccion === "clientes" && <Clientes />}
            {seccion === "ventas" && <Ventas />}
            {seccion === "reportes" && <Reportes />} {/* 🔥 FIX */}
            {seccion === "usuarios" && <Usuarios />}

          </div>
        </div>

      </main>
    </div>
  );
}