import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Productos from "../modules/productos/Productos";
import Clientes from "../modules/clientes/Clientes";
import Usuarios from "../modules/usuarios/Usuarios";
import Ventas from "../pages/VentasEmpresa";
import Reportes from "../pages/Reportes";
import PuntoDeVenta from "../modules/pos/PuntoDeVenta";

export default function DashboardEmpresa() {
  const [seccion, setSeccion] = useState("productos");
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();

  const menu = [
    { key: "productos", label: "Productos", icon: "📦" },
    { key: "clientes", label: "Clientes", icon: "👥" },
    { key: "ventas", label: "Ventas", icon: "💰" },
    { key: "reportes", label: "Reportes", icon: "📊" },
    { key: "usuarios", label: "Usuarios", icon: "🧑‍💼" },
    { key: "pos", label: "Punto de venta", icon: "🛒" },

  ];

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* 🔷 SIDEBAR */}
      <aside className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white p-6 shadow-xl">
        
        <h2 className="text-2xl font-bold mb-10 text-cyan-400">
          🐟 FishWare
        </h2>

        <nav className="flex flex-col gap-2">
          {menu.map((item) => (
            <button
              key={item.key}
              onClick={() => setSeccion(item.key)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${
                  seccion === item.key
                    ? "bg-cyan-500 text-white shadow-lg scale-105"
                    : "hover:bg-slate-700 text-gray-300"
                }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* 🔶 MAIN */}
      <main className="flex-1 flex flex-col">

        {/* 🔥 TOPBAR */}
        <div className="flex justify-between items-center bg-white px-8 py-4 shadow-sm border-b">
          
          <h1 className="text-xl font-semibold text-gray-700 capitalize">
            {seccion}
          </h1>

          <div className="relative">
            <div
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 cursor-pointer bg-gray-100 px-4 py-2 rounded-xl hover:bg-gray-200 transition"
            >
                 <span className="font-medium">Admin</span> 
            </div>

            {open && (
              <div className="absolute right-0 mt-2 w-52 bg-white shadow-xl rounded-xl overflow-hidden z-50 animate-fadeIn">

                <button
                  onClick={() => {
                    setOpen(false);
                    navigate("/perfil");
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100"
                >
                  👤 Mi perfil
                </button>

                <button className="w-full text-left px-4 py-3 hover:bg-gray-100">
                  ⚙️ Configuración
                </button>

                <button
                  onClick={() => {
                    localStorage.clear();
                    navigate("/");
                  }}
                  className="w-full text-left px-4 py-3 text-red-500 hover:bg-gray-100"
                >
                  🚪 Cerrar sesión
                </button>

              </div>
            )}
          </div>
        </div>

        {/* 📦 CONTENIDO */}
        <div className="p-6">
          <div className="bg-white p-6 rounded-2xl shadow-md min-h-[500px]">

            {seccion === "productos" && <Productos />}
            {seccion === "clientes" && <Clientes />}
            {seccion === "ventas" && <Ventas />}
            {seccion === "reportes" && <Reportes />}
            {seccion === "usuarios" && <Usuarios />}
            {seccion === "pos" && <PuntoDeVenta />}
          </div>
        </div>

      </main>
    </div>
  );
}