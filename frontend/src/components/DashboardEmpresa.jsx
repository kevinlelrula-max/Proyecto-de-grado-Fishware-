import { useState } from "react";
import Productos from "../modules/productos/Productos";

export default function DashboardEmpresa() {
  const [seccion, setSeccion] = useState("productos");

  return (
    <div className="flex min-h-screen bg-gray-100">

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
        </nav>
      </aside>

      <main className="flex-1 p-8">

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Dashboard
          </h1>

          <div className="bg-white px-4 py-2 rounded-xl shadow">
            👤 Admin
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="card">📦 Productos</div>
          <div className="card">💰 Ventas</div>
          <div className="card">👥 Clientes</div>
        </div>

        {/* CONTENIDO */}
        <div className="bg-white p-6 rounded-xl shadow">
          {seccion === "productos" && <Productos />}
          {seccion === "clientes" && <h2>Clientes</h2>}
          {seccion === "ventas" && <h2>Ventas</h2>}
          {seccion === "reportes" && <h2>Reportes</h2>}
        </div>

      </main>
    </div>
  );
}