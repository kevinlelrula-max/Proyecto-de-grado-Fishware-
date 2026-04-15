import { useEffect, useState } from "react";
import { getReporteProductos } from "../services/api";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#ef4444", "#8b5cf6"];

const Reportes = () => {
  const [data, setData] = useState([]);

useEffect(() => {
  const fetchData = async () => {
    const token = localStorage.getItem("token");

    const res = await getReporteProductos(token);

    // 🔥 CONVERTIR A NÚMERO (AQUÍ ESTÁ LA MAGIA)
    const dataFix = res.map(item => ({
      ...item,
      total_vendido: Number(item.total_vendido)
    }));

    console.log("DATA FIX:", dataFix);

    setData(dataFix);
  };

  fetchData();
}, []);

  if (!data || data.length === 0) {
    return <p className="p-6">No hay datos de ventas</p>;
  }

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">📊 Reportes de Ventas</h1>

      {/* 🔥 GRÁFICA DE BARRAS */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="font-bold mb-4">Productos más vendidos</h2>

        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nombre" />
            <YAxis />
            <Tooltip />
            <Bar 
              dataKey="total_vendido" 
              fill="#16a34a" 
              radius={[10, 10, 0, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 🔥 GRÁFICA PIE */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="font-bold mb-4">Distribución de ventas</h2>

        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={data}
              dataKey="total_vendido"
              nameKey="nombre"
              cx="50%"
              cy="50%"
              outerRadius={120}
              label
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 🔥 LISTA BONITA */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="font-bold mb-2">Top productos</h2>

        {data.map((p, i) => (
          <div key={i} className="flex justify-between border-b py-1">
            <span>{p.nombre}</span>
            <span className="font-bold text-green-600">
              {p.total_vendido}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Reportes;